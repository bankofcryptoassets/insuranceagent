import axios from 'axios';

interface LoanDetails {
  loan_amount: number;
  remaining_amount: number;
  up_front_payment: number;
  asset_price: number;
  status: string;
}

interface InsuranceDetails {
  insuredAmount: number;
  strikePrice: number;
  expiryDate: string;
  instrumentName: string;
  btcQuantity: number;
}

interface InsurancePurchase {
  insuranceId: string;
  insuredAmount: number;
  strikePrice: number;
  expiryDate: string;
  status: string;
}

interface InsuranceRollover {
  insuranceId: string;
  newExpiryDate: string;
  newStrikePrice: number;
  status: string;
}

interface InsuranceCancellation {
  insuranceId: string;
  status: string;
  cancelledAt: string;
}

interface ActiveInsurance {
  insuranceId: string;
  loanId: string;
  insuredAmount: number;
  strikePrice: number;
  expiryDate: string;
  status: string;
}

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001/api';

export async function call(name: string, args: string) {
    const functionMapping: { [key: string]: Function } = {
        fetch_Details_for_loan: fetchLoanDetails,
        calculate_insurance_details: calculateInsuranceDetails,
        purchase_insurance: purchaseInsurance,
        rollover_insurance: rolloverInsurance,
        cancel_insurance: cancelInsurance,
        get_insurance_details: getInsuranceDetails,
        get_all_active_insurances: getAllActiveInsurances,
    };
  
    const result = await functionMapping[name](JSON.parse(args));
  
    return result;
  }

/**
 * Fetches loan details for a user
 * @param loanId - The ID of the loan
 * @returns Loan details
 */
async function fetchLoanDetails(obj: any): Promise<LoanDetails> {
  try {
    const loanId = obj.loanId;
    const response = await axios.get(`${API_BASE_URL}/loan/${loanId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch loan details: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Calculates insurance details for a loan
 * @param loanId - The ID of the loan
 * @returns Insurance details
 */
async function calculateInsuranceDetails(obj: any): Promise<InsuranceDetails> {
  try {
    const loanId = obj.loanId;
    const response = await axios.get(`${API_BASE_URL}/insurance/calculate/${loanId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to calculate insurance details: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Purchases insurance for a loan
 * @param loanId - The ID of the loan
 * @param userAddress - The user's wallet address
 * @returns Insurance purchase details
 */
async function purchaseInsurance(
  obj: any
): Promise<InsurancePurchase> {
  try {
    const loanId = obj.loanId;
    const userAddress = obj.userAddress;
    const response = await axios.post(`${API_BASE_URL}/insurance/purchase/${loanId}`, {
      userAddress
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to purchase insurance: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Rolls over existing insurance to a new period
 * @param insuranceId - The ID of the insurance
 * @returns Rollover details
 */
async function rolloverInsurance(obj: any): Promise<InsuranceRollover> {
  try {
    const insuranceId = obj.insuranceId;
    const response = await axios.post(`${API_BASE_URL}/insurance/rollover/${insuranceId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to rollover insurance: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Cancels an active insurance
 * @param insuranceId - The ID of the insurance
 * @returns Cancellation details
 */
async function cancelInsurance(obj: any): Promise<InsuranceCancellation> {
  try {
    const insuranceId = obj.insuranceId;
    const response = await axios.post(`${API_BASE_URL}/insurance/cancel/${insuranceId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to cancel insurance: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Gets details of an active insurance
 * @param loanId - The ID of the loan
 * @returns Insurance details
 */
async function getInsuranceDetails(obj: any): Promise<InsuranceDetails | { message: string }> {
  try {
    const loanId = obj.loanId;
    const response = await axios.get(`${API_BASE_URL}/insurance/details/${loanId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to get insurance details: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Gets all active insurances
 * @returns List of active insurances
 */
async function getAllActiveInsurances(obj: any): Promise<ActiveInsurance[]> {
  try {
    const userId = obj.userId;
    const response = await axios.get(`${API_BASE_URL}/insurance/active`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to get active insurances: ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

export {
  fetchLoanDetails,
  calculateInsuranceDetails,
  purchaseInsurance,
  rolloverInsurance,
  cancelInsurance,
  getInsuranceDetails,
  getAllActiveInsurances,
  type LoanDetails,
  type InsuranceDetails,
  type InsurancePurchase,
  type InsuranceRollover,
  type InsuranceCancellation,
  type ActiveInsurance
}; 