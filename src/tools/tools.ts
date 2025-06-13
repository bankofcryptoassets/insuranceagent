import { fetchLoanDetails, calculateInsurance, purchaseInsurance, rolloverInsurance, cancelInsurance, getInsuranceDetails, getAllActiveInsurances } from "./definition";
import { ChatCompletionTool } from "openai/resources";

export const tools: ChatCompletionTool[] = [
    fetchLoanDetails,
    calculateInsurance,
    purchaseInsurance,
    rolloverInsurance,
    cancelInsurance,
    getInsuranceDetails,
    getAllActiveInsurances
];
