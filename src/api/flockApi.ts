// src/api/flockApi.ts
import axios from "axios";
import { getCurrentUserId } from "@/components/security/LoginPage";

const API_URL = "http://84.16.235.111:2135/api/flock";

const getModuleId = (): string => {
  return sessionStorage.getItem('selectedBranchId') || 'N/A';
};

const module_id = getModuleId();
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
  partners: number, // Changed from qty to partners
  branch_id: number,
  company_id: number,
  city_id: number,
  region_id: number,
  flock_details: any[] = [] // New parameter for partner details
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2, // Operation for "Add"
      flock_name,
      partners: partners, // Changed from qty to partners
      branch_id,
      company_id,
      city_id,
      region_id,
      module_id,
      created_by: user_id,
      flock_details: flock_details.length > 0 ? flock_details : undefined // Include partner details if any
    });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateFlock = async (
  flock_id: number,
  flock_name: string,
  partners: number, // Changed from qty to partners
  branch_id: number,
  company_id: number,
  city_id: number,
  region_id: number,
  flock_details: any[] = [] // New parameter for partner details
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3, // Operation for "Update"
      flock_id,
      flock_name,
      partners: partners, // Changed from qty to partners
      branch_id,
      company_id,
      city_id,
      region_id,
      updated_by: user_id,
      flock_details: flock_details.length > 0 ? flock_details : undefined // Include partner details if any
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
      module_id
    });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Get by branch_id
export const getFlockByBranch = async (branch_id: number) => {
  try {
    const res = await axios.post(API_URL, { operation: 6, branch_id, module_id });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};