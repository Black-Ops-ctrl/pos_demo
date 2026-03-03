import axios from "axios";

const API_URL = "http://84.16.235.111:2140/api/branches";
import { getCurrentUserId } from "@/components/security/LoginPage";




const getModuleId = (): string => {
  return sessionStorage.getItem('selectedBranchId') || '2'; 
};
const user_id = getCurrentUserId();
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

  // Something else happened
  console.error("Unexpected error:", error);
  throw new Error("Unexpected error occurred. Check console for details.");
};

// ----------------------------------------------------
// --- API Functions Updated with proper payload structure ---
// ----------------------------------------------------

// Get all branches (Operation 1)
export const getBranches = async () => {
  const module_id = getModuleId();

  try {
    const res = await axios.post(API_URL, {
      operation: 1
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Add new branch (Operation 2) - UPDATED with proper payload structure
export const addBranch = async (
  branch_name: string,
  farm_type: string,
  city: string,
  account_id: number,
  no_of_partners?: number,
  discounts?: string,
  extra_discount?: number,
  remarks?: string,
  is_owned?: boolean,
  is_rent?: boolean,
  farm_description?: string
) => {
  const module_id = getModuleId();
  const moduleIdNum = parseInt(module_id);

  try {
    // Base payload structure
    const payload: any = {
      operation: 2,
      
      branch_name,
      account_id,
      city,
    };

    
      
      

    const res = await axios.post(API_URL, payload);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Update existing branch (Operation 3) - UPDATED with proper payload structure
export const updateBranch = async (
  branch_id: number,
  branch_name: string,
  farm_type: string,
  city: string,
  account_id: number,
  no_of_partners?: number,
  discounts?: string,
  extra_discount?: number,
  remarks?: string,
  is_owned?: boolean,
  is_rent?: boolean,
  farm_description?: string
) => {
  const module_id = getModuleId();
  const moduleIdNum = parseInt(module_id);

  try {
    // Base payload structure
    const payload: any = {
      operation: 3,
     
      branch_id,
      branch_name,
      account_id,
      city,
    };

    

    const res = await axios.post(API_URL, payload);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Delete branch (Operation 4)
export const deleteBranch = async (branch_id: number) => {
  const module_id = getModuleId();

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

//🔹 Approve Multiple Journal Entries (Bulk Status Update)
export const approveBranch = async (branch_ids: number[]) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 5,                        
      updated_by: user_id,                 
                           
      branch_ids               
    });

    return res.data; // returns the updated invoices list
  } catch (error) {
    handleApiError(error);
  }
};

//🔹 Unapprove Multiple Journal Entries (Bulk Status Update)
export const UnapproveBranch = async (branch_ids: number[]) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 6,                        // 5 = Unapprove operation
      updated_by: user_id,                 // current user performing approval
                              // current branch/module context
      branch_ids,                   // array of IDs to unapprove
    });

    return res.data; // returns the updated invoices list
  } catch (error) {
    handleApiError(error);
  }
};




