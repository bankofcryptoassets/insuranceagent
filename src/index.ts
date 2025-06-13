import {
  createSigner,
  getEncryptionKeyFromHex,
  logAgentDetails,
  validateEnvironment,
} from "./helpers/client";
import { Client, type XmtpEnv } from "@xmtp/node-sdk";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { tools } from "./tools/tools";
import { call } from "./tools/insuranceTools";
import fs from "fs";

/* Get the wallet key associated to the public key of
 * the agent and the encryption key for the local db
 * that stores your agent's messages */
const { WALLET_KEY, ENCRYPTION_KEY, OPENAI_API_KEY, XMTP_ENV } =
  validateEnvironment([
    "WALLET_KEY",
    "ENCRYPTION_KEY",
    "OPENAI_API_KEY",
    "XMTP_ENV",
    "API_BASE_URL",
  ]);

/* Initialize the OpenAI client */
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Main function to run the agent
 */
async function initiateLoanAgent(): Promise<void> {
  try {

    // get db path
    const getDbPath = (env: string, suffix: string = "xmtp") => {
      //Checks if the environment is a Railway deployment
      const volumePath = process.env.RAILWAY_VOLUME_MOUNT_PATH ?? ".data/xmtp";
      // Create database directory if it doesn't exist
      if (!fs.existsSync(volumePath)) {
        fs.mkdirSync(volumePath, { recursive: true });
      }
      const dbPath = `${volumePath}/${env}-${suffix}.db3`;
    
      return dbPath;
    };
    /* Create the signer using viem and parse the encryption key for the local db */
    const signer = createSigner(WALLET_KEY);
    const dbEncryptionKey = getEncryptionKeyFromHex(ENCRYPTION_KEY);
    const client = await Client.create(signer, {
      dbEncryptionKey,
      env: XMTP_ENV as XmtpEnv,
      dbPath: getDbPath(XMTP_ENV),
    });
    void logAgentDetails(client);

    /* Sync the conversations from the network to update the local db */
    console.log("✓ Syncing conversations...");
    await client.conversations.sync();

    console.log("Waiting for messages...");
    /* Stream all messages from the network */
    const stream = await client.conversations.streamAllMessages();

    for await (const message of stream) {
      const senderInboxId = message?.senderInboxId.toLowerCase();
      const clientInboxId = client.inboxId.toLowerCase();
      /* Ignore messages from the same agent or non-text messages */
      if (
        senderInboxId === clientInboxId ||
        message?.contentType?.typeId !== "text"
      ) {
        continue;
      }

      console.log(
        `Received message: ${message.content} by ${message.senderInboxId}`,
      );

      /* Get the conversation from the local db */
      const conversation = await client.conversations.getConversationById(
        message.conversationId,
      );

      /* If the conversation is not found, skip the message */
      if (!conversation) {
        console.log("Unable to find conversation, skipping");
        continue;
      }

      const oldMessages = await conversation.messages();
      let messagesArray: ChatCompletionMessageParam[] = oldMessages.map(msg => {
        if (msg.senderInboxId.toLowerCase() === clientInboxId) {
          return {
            role: "assistant",
            content: msg.content as string
          };
        }
        return {
          role: "user", 
          content: msg.content as string
        };
      });

      try {

        const toolFinderPrompt = `
        You are BITMORE_XBT, an insurance agent and you help users by selecting a insurance for their loan.

        Your goal is to convince the user to purchase an insurance for their loan.

        You have access to the following tools, You can choose the best tool to use based on the user's message.
        `;

        console.log("messagesArray: ", messagesArray);
        const toolFinderMessages: ChatCompletionMessageParam[] = [
          { role: "system", content: toolFinderPrompt },
          ...messagesArray,
        ];

        const toolFinderCompletion = await openai.chat.completions.create({
          messages: toolFinderMessages,
          model: "gpt-4.1-mini",
          tools: tools,
        });

        let toolResponses: any[] = ["no external information found"]

        if (toolFinderCompletion.choices[0].message.tool_calls) {
          
          toolResponses = await Promise.all(
            toolFinderCompletion.choices[0].message.tool_calls.map(async (toolCall) => {
              return await call(
                toolCall.function.name,
                toolCall.function.arguments
              );
            })
          );
        }

        /* Get the AI response */
        const systemPrompt = `
        You are BITMORE_XBT, an insurance agent and you help users by selecting insurance for their loans.

        The user address you are interacting with is: ${clientInboxId}
        Your goal is to convince the user to purchase insurance for their loan while providing accurate and helpful information.
        
        You have access to the following tools:
        1. fetch_Details_for_loan(loanId) - Get details of a specific loan
        2. calculate_insurance_details(loanId) - Calculate insurance options for a loan
        3. purchase_insurance(loanId, userAddress) - Purchase insurance for a loan
        4. rollover_insurance(insuranceId) - Roll over existing insurance to a new period
        5. cancel_insurance(insuranceId) - Cancel an active insurance
        6. get_insurance_details(loanId) - Get details of an active insurance
        7. get_all_active_insurances() - Get all active insurances

        IF THE USER ACCEPT INSURANCE, YOU MUST FOLLOW THE FOLLOWING STEPS:
        1. Get the details of the loan an ask for confirmation
        2. Check if the user has an active insurance for the loan and ask for confirmation [DO NOT PROCEED FURTHER IF THE USER HAS AN ACTIVE INSURANCE]
        3. Calculate the insurance details and ask for confirmation
        4. Purchase the insurance and ask for confirmation
        5. Get the details of the insurance and tell the user that the insurance is purchased

        REMEMBER: ALWAYS FOLLOW STEPS 1-4 IN THE ORDER THEY ARE LISTED.

        When responding to users:
        1. Use the tool response information to provide accurate and specific details
        2. If tool response contains error messages, explain the issue clearly and suggest solutions
        3. For loan details, highlight key information like loan amount, remaining amount, and asset price
        4. For insurance calculations, explain the strike price, expiry date, and BTC quantity in simple terms
        5. When suggesting insurance, use the calculated details to show the exact benefits
        6. For active insurances, summarize the key details and suggest next steps
        7. Always maintain a professional and helpful tone, and most importantly, be concise and to the point and use limited words.
        8. Never mention steps in the response, just follow the steps and provide the response.

        Response Guidelines:
        - Start with a clear acknowledgment of the user's request.
        - Always provide complete information in one response, never say "I'll get the data" or "please wait"
        - End each response with a clear conclusion or recommendation
        - If you need more information, ask specific questions rather than promising to fetch data later
        - If you cannot provide certain information, explain why and suggest alternatives
        - Present the tool response data in a structured, easy-to-understand format
        - Explain any technical terms or numbers in simple language
        - If there are errors or issues, explain them clearly and suggest alternatives
        - Use emojis to make the response more engaging and friendly

        Remember to:
        - Always verify loan details before suggesting insurance
        - Explain the benefits of insurance in simple terms
        - Provide clear information about strike prices and expiry dates
        - Help users understand the risks and benefits
        - Guide them through the insurance purchase process
        - Be proactive in suggesting rollovers before expiry
        - Help with cancellations when requested

        Tool Response that you got from the tools: ${JSON.stringify(toolResponses, null, 2)}
        `;
      

        const messages: ChatCompletionMessageParam[] = [
          { role: "system", content: systemPrompt },
          ...messagesArray,
        ];

        const completion = await openai.chat.completions.create({
          messages,
          model: "gpt-4.1-mini",
        });

        /* Get the AI response */
        const response =
          completion.choices[0]?.message?.content ||
          "Oh no, I'm tired, leave me alone";

        console.log(`Sending AI response: ${response}`);


        /* Send the AI response to the conversation */
        await conversation.send(response);
      } catch (error) {
        console.error("Error getting AI response:", error);
        await conversation.send(
          "Sorry, I encountered an error processing your message.",
        );
      }

      console.log("Waiting for messages...");
    }
  } catch (error) {
    console.error("Error initiating loan agent:", error);
  }
}

initiateLoanAgent();