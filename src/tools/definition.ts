import { ChatCompletionTool } from "openai/resources";

export const fetchLoanDetails: ChatCompletionTool = {
  type: "function",
  function: {
    name: "fetch_Details_for_loan",
    description: "Fetches loan details for a user when provided with the loan ID",
    parameters: {
      type: "object", 
      properties: {
        loanId: {
          type: "string",
          description: "The ID of the loan to fetch details for"
        }
      },
      required: ["loanId"],
      additionalProperties: false
    }
  }
};

export const calculateInsurance: ChatCompletionTool = {
  type: "function", 
  function: {
    name: "calculate_insurance_details",
    description: "Calculates available insurance details for a loan based on loan amount and other parameters",
    parameters: {
      type: "object",
      properties: {
        loanId: {
          type: "string",
          description: "The ID of the loan to calculate insurance for"
        }
      },
      required: ["loanId"],
      additionalProperties: false
    }
  }
};

export const purchaseInsurance: ChatCompletionTool = {
  type: "function",
  function: {
    name: "purchase_insurance",
    description: "Purchases insurance coverage for a loan",
    parameters: {
      type: "object",
      properties: {
        loanId: {
          type: "string", 
          description: "The ID of the loan to purchase insurance for"
        },
        userAddress: {
          type: "string",
          description: "The wallet address of the user"
        }
      },
      required: ["loanId", "userAddress"],
      additionalProperties: false
    }
  }
};

export const rolloverInsurance: ChatCompletionTool = {
  type: "function",
  function: {
    name: "rollover_insurance",
    description: "Extends or rolls over an existing insurance policy",
    parameters: {
      type: "object",
      properties: {
        insuranceId: {
          type: "string",
          description: "The ID of the insurance policy to rollover"
        },
        newExpiryDate: {
          type: "string",
          description: "The new expiry date for the rolled over policy"
        },
        newStrikePrice: {
          type: "number",
          description: "The new strike price for the rolled over policy"
        }
      },
      required: ["insuranceId", "newExpiryDate", "newStrikePrice"],
      additionalProperties: false
    }
  }
};

export const cancelInsurance: ChatCompletionTool = {
  type: "function",
  function: {
    name: "cancel_insurance",
    description: "Cancels an active insurance policy",
    parameters: {
      type: "object",
      properties: {
        insuranceId: {
          type: "string",
          description: "The ID of the insurance policy to cancel"
        }
      },
      required: ["insuranceId"],
      additionalProperties: false
    }
  }
};

export const getInsuranceDetails: ChatCompletionTool = {
  type: "function",
  function: {
    name: "get_insurance_details",
    description: "Retrieves details of a specific insurance policy",
    parameters: {
      type: "object",
      properties: {
        insuranceId: {
          type: "string",
          description: "The ID of the insurance policy to get details for"
        }
      },
      required: ["insuranceId"],
      additionalProperties: false
    }
  }
};

export const getAllActiveInsurances: ChatCompletionTool = {
  type: "function",
  function: {
    name: "get_all_active_insurances",
    description: "Retrieves a list of all active insurance policies for a user",
    parameters: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "The ID of the user to get active insurances for"
        }
      },
      required: ["userId"],
      additionalProperties: false
    }
  }
};
