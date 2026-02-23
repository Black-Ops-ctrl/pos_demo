import axios from "axios";

const API_URL = "http://84.16.235.111:2135/api/getVendorLedger";
const image_URL = "http://84.16.235.111:2135/api/company";

const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error("API error:", error.response.data);
      throw new Error(
        error.response.data?.message || `API Error: ${error.response.status}`
      );
    } else if (error.request) {
      console.error("No response from server:", error.request);
      throw new Error("No response from server. Please check your connection.");
    }
  }
  console.error("Unexpected error:", error);
  throw new Error("Unexpected error occurred. Check console for details.");
};

// Get vendor ledger
export const getVendorLedger = async (
  account_id: number,
  start_date?: Date,
  end_date?: Date
) => {
  try {
    const requestData: any = { account_id };
    
    if (start_date) {
      requestData.start_date = start_date.toISOString().split('T')[0];
    }
    
    if (end_date) {
      requestData.end_date = end_date.toISOString().split('T')[0];
    }

    const res = await axios.post(API_URL, requestData);
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Get all companies
export const getCompanies = async () => {
  try {
    const res = await axios.post(image_URL, { 
      operation: 1    
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Get company image and data
export const getCompanyimg = async () => {
  try {
    const res = await axios.post(image_URL, {
      operation: 1
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};