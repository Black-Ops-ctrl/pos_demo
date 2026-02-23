import { getCurrentUserId } from "@/components/security/LoginPage";
import axios from "axios";


const API_URL = "http://84.16.235.111:2135/api/purchase-return";
const image_URL = "http://84.16.235.111:2135/api/company";
const Vehicle_URL = "http://84.16.235.111:2135/api/vehicles";


const user_id = getCurrentUserId();

/**
 * Retrieves the 'module_id' (which corresponds to 'selectedBranchId') from sessionStorage.
 * This ensures the correct branch context is sent with every API request.
 * @returns {string | null} The selected branch ID or null if not found.
 */
const getModuleId = (): string | null => {
  return sessionStorage.getItem('selectedBranchId');
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

// 🔹 Get All GRNs
export const getPurchasereturninvoices = async (startDate?: string, endDate?: string) => {
  try {
    const requestData: any = { 
      operation: 1,
      module_id: 3, // add module_id
      start_date: startDate || "", // match API key
      end_date: endDate || ""      // match API key
    };

    const res = await axios.post(API_URL, requestData);
    console.log("API response:", res.data);
    return res.data.data; // assuming your API returns array directly
  } catch (error) {
    handleApiError(error);
  }
};

export const createPurchasereturnInvoice = async (
  vendor_id: number,
  return_date: string,
  total_amount: number,
  total_discount: number,
  total_tax: number,
  branch_id: number,
  
  remarks: string,
  

  items: {
    item_id: number;
    returned_qty: number;
    unit_price: number;
    discount: number;
    discount_percentage: number;
   
    uom_id: number;
  }[]
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      vendor_id,
      return_date,
      total_amount,
      total_discount,
      total_tax,
      branch_id,
      module_id:module_id,
      remarks,
      created_by:user_id,
      items
    });

    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};


// 🔹 Update Purchase Invoice Return (with JSON items)
export const updatePurchaseReturnInvoice = async (
  purchase_return_id: number,
  vendor_id: number,
  return_date: string,
  total_amount: number,
  total_discount: number,
  total_tax: number,
  branch_id: number,
  
  remarks: string,
 

  items: {
    item_id: number;
    returned_qty: number;
    unit_price: number;
    discount: number;
    discount_percentage: number;
   
    uom_id: number;
  }[]
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      purchase_return_id,
      vendor_id,
      return_date,
      total_amount,
      total_discount,
      total_tax,
      branch_id,
      module_id:module_id,
      remarks,
      updated_by:user_id,
      items
    });

    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};
//  Delete Vendor
export const deleteReturnInvoice = async (purchase_return_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 4,
      purchase_return_id,
      module_id: module_id
    });
    return res.data.data ; 
  } catch (error) {
    handleApiError(error);
  }
};
     
export const approvePurchaseReturn = async (
  purchase_return_ids: number[]
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 5,
      purchase_return_ids
    });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
export const unApprovePurchaseReturn = async (
  purchase_return_ids: number[]
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 6,
      purchase_return_ids
    });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};



export const getCompanyimg = async () => {
  try {
    const res = await axios.post(image_URL, {
      operation: 1
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getVehicles = async () => {
  try {
    const res = await axios.post(Vehicle_URL, {
      operation: 1
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};