// src/api/branchApi.ts
import axios from "axios";

const API_URL = "http://84.16.235.111:2091/api/branches";

/**
 * Retrieves the 'module_id' (which corresponds to 'selectedBranchId') from sessionStorage.
 * This ensures the correct branch context is sent with every API request.
 * @returns {string} The selected branch ID or 'N/A' if not found.
 */
const getModuleId = (): string => {
  // Use 'selectedBranchId' as the module_id for API operations
  return sessionStorage.getItem('selectedBranchId') || 'N/A';
};

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

// ----------------------------------------------------
// --- API Functions Updated with 'module_id' ---
// ----------------------------------------------------

// Get all branches
export const getBranches = async () => {
  const module_id = getModuleId(); // Get module_id
  
  try {
    const res = await axios.post(API_URL, { 
      operation: 1,
      module_id, // 🔑 Added module_id
    });
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
  const module_id = getModuleId(); // Get module_id
  
  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      module_id, // 🔑 Added module_id
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
  const module_id = getModuleId(); // Get module_id
  
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      module_id, // 🔑 Added module_id
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
  const module_id = getModuleId(); // Get module_id
  
  try {
    const res = await axios.post(API_URL, {
      operation: 4,
      module_id, // 🔑 Added module_id
      branch_id,
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};