// src/api/flockApi.ts
import axios from "axios";
import { getCurrentUserId } from "@/components/security/LoginPage";

const API_URL = "http://84.16.235.111:2149/api/flock";

const getModuleId = (): number | null => {
  const selectedBranchId = sessionStorage.getItem('selectedBranchId');
  // Parse the ID to a number if it's not "N/A", otherwise set to null for the API
  const module_id = selectedBranchId && selectedBranchId !== 'N/A'
    ? parseInt(selectedBranchId, 10)
    : null;
  return module_id;
};

const user_id = getCurrentUserId(); 

// 🔹 Centralized error handler
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

// 1️⃣ Get all Flock
export const getFlock = async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1 });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const addFlock = async (
  flock_name: string,
  partners: number,
  branch_id: number,
  company_id: number,
  city_id: number,
  region_id: number,
  flock_details: any[] = []
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      flock_name,
      partners: partners,
      branch_id,
      company_id,
      city_id,
      region_id,
      module_id: getModuleId(), // Convert to number or null
      created_by: user_id,
      flock_details: flock_details.length > 0 ? flock_details : undefined
    });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateFlock = async (
  flock_id: number,
  flock_name: string,
  partners: number,
  branch_id: number,
  company_id: number,
  city_id: number,
  region_id: number,
  flock_details: any[] = []
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      flock_id,
      flock_name,
      partners: partners,
      branch_id,
      company_id,
      city_id,
      region_id,
      updated_by: user_id,
      module_id: getModuleId(), // Convert to number or null
      flock_details: flock_details.length > 0 ? flock_details : undefined
    });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteFlock = async (flock_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 4,
      flock_id,
      module_id: getModuleId() // Convert to number or null
    });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Get by branch_id
export const getFlockByBranch = async (branch_id: number) => {
  try {
    const res = await axios.post(API_URL, { 
      operation: 6, 
      branch_id, 
      module_id: getModuleId() // Convert to number or null
    });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};