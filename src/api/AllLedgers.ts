// src/api/branchApi.ts
import axios from "axios";

const API_URL = "http://84.16.235.111:2135/api/getAllLedgers";

const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    // Server responded with a status code outside 2xx
    if (error.response) {
      console.error("API error:", error.response.data);
      throw new Error(
        error.response.data?.message || `API Error: ${error.response.status}`
      );
    }
    // No response received (server down, network issue)
    else if (error.request) {
      console.error("No response from server:", error.request);
      throw new Error("No response from server. Please check your connection.");
    }
  }

  // Something else happened
  console.error("Unexpected error:", error);
  throw new Error("Unexpected error occurred. Check console for details.");
};

// Get all Vendors  Ledgers
export const getAllVendorsLedger = async (account_code: string,start_date:string,end_date:string) => {
  try {
    const res = await axios.post(API_URL, { operation: 1,account_code,start_date,end_date });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
      // Get Category wise Vendors Ledgers
export const getCategoryWiseVendorsLedger = async (start_date:string,end_date:string) => {
  try {
    const res = await axios.post(API_URL, { operation: 2,start_date,end_date });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Get all Vendors  Ledgers
export const getAllCustomersLedger = async (account_code: string,start_date:string,end_date:string) => {
  try {
    const res = await axios.post(API_URL, { operation: 3,account_code,start_date,end_date });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

      // Get Category wise Customers Ledgers
export const getCategoryWiseCustomersLedger = async (start_date:string,end_date:string) => {
  try {
    const res = await axios.post(API_URL, { operation: 4,start_date,end_date });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
