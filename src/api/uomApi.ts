// src/api/departmentApi.ts
import axios from "axios";

const API_URL = "http://84.16.235.111:2140/api/uom";


const getModuleId = (): string => {
  // It's returned as a string, which is what the API likely expects (even if it's a number in the database)
  return sessionStorage.getItem('selectedBranchId') || 'N/A'; 
};

// Use the dynamic module_id
const module_id = getModuleId();

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

// 1️⃣ Get all departments
export const getUOM= async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1 });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 2️⃣ Add department
export const addUOM= async (
  uom_name: string
 
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      uom_name
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 3️⃣ Update department
export const updateUOM = async (
  uom_id: number,
  uom_name: string
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      uom_id,
      uom_name
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 4️⃣ Delete department
export const deleteUOM = async (uom_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 4,
      uom_id
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
