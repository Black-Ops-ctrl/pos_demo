// src/api/branchApi.ts
import axios from "axios";

const API_URL = "http://84.16.235.111:2091/api/branches";

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

// Get all branches
export const getBranches = async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1 });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Add new branch
export const addBranch = async (
  branch_name: string,
  address: string,
  city: string
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      branch_name,
      address,
      city,
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Update existing branch
export const updateBranch = async (
  branch_id: number,
  branch_name: string,
  address: string,
  city: string
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      branch_id,
      branch_name,
      address,
      city,
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Delete branch
export const deleteBranch = async (branch_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 4,
      branch_id,
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
