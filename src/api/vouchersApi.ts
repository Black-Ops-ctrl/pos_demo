// src/api/branchApi.ts
import axios from "axios";

const API_URL = "http://84.16.235.111:2149/api/vouchers";

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

// Get all vouchers
export const getVouchers = async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1 });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Add new Voucher
export const addVoucher = async (
  voucher_name: string,
  description: string
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      voucher_name,
      description
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Update existing branch
export const updateVoucher = async (
  voucher_id: number,
  voucher_name: string,
  description: string
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      voucher_id,
      voucher_name,
      description
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
// Get Voucher by ID
export const getVoucherByID = async (voucher_id: number) => {
  try {
    const res = await axios.post(API_URL, { operation: 4, voucher_id });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

