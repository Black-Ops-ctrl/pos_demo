// src/api/departmentApi.ts
import axios from "axios";

const API_URL = "http://84.16.235.111:2091/api/departments";

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
export const getDepartments = async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1 });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 2️⃣ Add department
export const addDepartment = async (
  dep_name: string,
  branch_id: number,
  company_id: number
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      dep_name,
      branch_id,
      company_id,
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 3️⃣ Update department
export const updateDepartment = async (
  dep_id: number,
  dep_name: string,
  branch_id: number,
  company_id: number
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      dep_id,
      dep_name,
      branch_id,
      company_id,
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 4️⃣ Delete department
export const deleteDepartment = async (dep_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 4,
      dep_id,
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 5️⃣ Get dropdown data (branches & companies)
export const getBranchAndCompanyList = async () => {
  try {
    const res = await axios.get(`${API_URL}/dropdown-data`);
    return res.data; // Expected: { branches: [], companies: [] }
  } catch (error) {
    handleApiError(error);
  }
};
