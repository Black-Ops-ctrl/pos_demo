import axios from "axios";

const API_URL = "http://84.16.235.111:2140/api/vendors";
const naya_url = "http://84.16.235.111:2140/api/getvendors";

const getModuleId = (): number | null => {
  const branchId = sessionStorage.getItem('selectedBranchId');
  // FIX: Return null instead of 'N/A' for invalid branch IDs
  if (!branchId || branchId === 'N/A') {
    return null;
  }
  return parseInt(branchId, 10);
};

// Centralized error handler
const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error("API error:", error.response.data);
      throw new Error(
        error.response.data?.error || error.response.data?.message || `API Error: ${error.response.status}`
      );
    } else if (error.request) {
      console.error("No response from server:", error.request);
      throw new Error("No response from server. Please check your connection.");
    }
  }
  console.error("Unexpected error:", error);
  throw new Error("Unexpected error occurred. Check console for details.");
};

// Get Vendors
export const getVendors = async () => {
  try {
    const module_id = getModuleId();
    const payload: any = { operation: 1 };
    
    // FIX: Only add module_id if it's a valid number
    if (module_id !== null) {
      payload.module_id = module_id;
    }
    
    console.log("Sending get vendors payload:", payload);
    const res = await axios.post(API_URL, payload);
    console.log("API Response:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getnewVendors = async () => {
  try {
    const res = await axios.post(naya_url);
    console.log("API Response:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Add Vendor - FIXED
export const addVendor = async (
  vendor_name: string,
  phone: string,
  email: string,
  address: string,
  account_id: number | null
) => {
  try {
    const module_id = getModuleId();
    
    const payload: any = {
      operation: 2,
      vendor_name,
      phone,
      email,
      address,
      account_id: account_id ? Number(account_id) : null
    };
    
    // FIX: Only add module_id if it's a valid number
    if (module_id !== null) {
      payload.module_id = module_id;
    }
    
    console.log("Sending add vendor payload:", payload);
    
    const res = await axios.post(API_URL, payload);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Update Vendor - FIXED
export const updateVendor = async (
  vendor_id: number,
  vendor_name: string,
  phone: string,
  email: string,
  address: string,
  account_id: number | null
) => {
  try {
    const module_id = getModuleId();
    
    const payload: any = {
      operation: 3,
      vendor_id,
      vendor_name,
      phone,
      email,
      address,
      account_id: account_id ? Number(account_id) : null
    };
    
    // FIX: Only add module_id if it's a valid number
    if (module_id !== null) {
      payload.module_id = module_id;
    }
    
    console.log("Sending update vendor payload:", payload);
    
    const res = await axios.post(API_URL, payload);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Delete Vendor
export const deleteVendor = async (vendor_id: number) => {
  try {
    const module_id = getModuleId();
    
    const payload: any = {
      operation: 4,
      vendor_id
    };
    
    // FIX: Only add module_id if it's a valid number
    if (module_id !== null) {
      payload.module_id = module_id;
    }
    
    console.log("Sending delete vendor payload:", payload);
    
    const res = await axios.post(API_URL, payload);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};