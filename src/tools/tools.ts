import { fetchLoanDetails, calculateInsurance, purchaseInsurance, rolloverInsurance, cancelInsurance } from "./definition";
import { ChatCompletionTool } from "openai/resources";

export const tools: ChatCompletionTool[] = [
    fetchLoanDetails,
    calculateInsurance,
    purchaseInsurance,
    rolloverInsurance,
    cancelInsurance,
];
