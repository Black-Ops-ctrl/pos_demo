// src/api/departmentApi.ts
import axios from "axios";

const API_URL = "http://84.16.235.111:2140/api/regions";
const getModuleId = (): string => {
  return sessionStorage.getItem('selectedBranchId') || 'N/A';
};
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
export const getRegions= async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1 });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 2️⃣ Add department
export const addRegion = async (
  region_name: string
 
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      region_name,
      module_id
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 3️⃣ Update department
export const updateRegion = async (
  region_id: number,
  region_name: string
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      region_id,
      region_name,
      module_id
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 4️⃣ Delete department
export const deleteRegion = async (region_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      p_operation: 4,
      region_id,
    });
    return res.data;

  } catch (error) {
    handleApiError(error);
  }
};
