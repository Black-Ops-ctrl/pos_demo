// src/api/companyApi.ts
import axios from "axios";

const API_URL = "http://84.16.235.111:2149/api/users";

const getModuleId = (): string => {
  return sessionStorage.getItem('selectedBranchId') || 'N/A';
};

const module_id = getModuleId(); 

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

// Get all companies
export const getUsers = async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1 });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Add new company
export const addUser = async (
  full_name: string,
  username  : string,
  email: string,
  password: string,
  dep_id: number,
  branch_id :number,
  role_id:number,
  created_by:number
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      full_name,
      username,
      email,
      password,
      dep_id,
      branch_id,
      role_id,
      created_by
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Update existing user
export const updateUser = async (
  user_id:number,
  full_name: string,
  username  : string,
  email: string,
  password: string,
  dep_id: number,
  branch_id :number,
  role_id:number,
  status:string,
  updated_by:number,

) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      user_id,
      full_name,
      username,
      email,
      password,
      dep_id,
      branch_id,
      role_id,
      status,
      updated_by
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Change Staus To Lock/Active
export const LockStatus = async (
  user_id:number,

  status: string | null = null,
  updated_by:number,

) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      user_id,
     
      status,
      updated_by
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};


//////      Change Status to Active/Inactive
export const ChangeStatus = async (
  user_id:number,

  status: string | null = null,
  updated_by:number,

) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      user_id,
     
      status,
      updated_by
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

