// src/api/departmentApi.ts
import axios from "axios";
import { getCurrentUserId } from "@/components/security/LoginPage";
const API_URL = "http://84.16.235.111:2091/api/flock";
const getModuleId = (): string => {
  return sessionStorage.getItem('selectedBranchId') || 'N/A';
};
 const module_id = getModuleId(); 
 const user_id = getCurrentUserId()
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

// 1️⃣ Get all City
export const getFlock= async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1,module_id });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};


export const addFlock = async (
   flock_name: string,
  qty: number,
  branch_id: number,
  stock: number,
  city_id: number,
  region_id: number,
 
) => {
  try {
    const res = await axios.post(API_URL, {
       operation: 2, // Operation for "Add"
      flock_name,
      qty: qty, 
      branch_id,
      stock: stock,
      city_id,
      region_id,
      module_id,
     created_by:user_id

    });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};


export const updateFlock = async (
  flock_id: number,
  flock_name: string,
  qty: number,
  branch_id: number,
  stock: number,
  city_id: number,
  region_id: number
) => {
  try {
    const res = await axios.post(API_URL, {
       operation: 3, // Operation for "Update"
      flock_id,
      flock_name,
      qty: qty, // Make sure qty is passed as a string
      branch_id,
      stock: stock, // Make sure stock is passed as a string
      city_id,
      region_id,
    
      updated_by:user_id
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
    });
    return res.data.data; 
  } catch (error) {
    handleApiError(error);
  }
};
