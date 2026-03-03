import axios from "axios";

const API_URL = "http://84.16.235.111:2140/api/so-return";

const image_URL = "http://84.16.235.111:2140/api/company";

import { getCurrentUserId } from "@/components/security/LoginPage";

// --- Utility Functions ---

const getModuleId = (): string | null => {
  return sessionStorage.getItem("selectedBranchId");
};

const module_id = getModuleId();
const user_id = getCurrentUserId();

// 🔹 Centralized error handler
const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error("API error:", error.response.data);
      throw new Error(
        error.response.data?.message ||
          `API Error: ${error.response.status}`
      );
    } else if (error.request) {
      console.error("No response from server:", error.request);
      throw new Error("No response from server. Please check your connection.");
    }
  }
  console.error("Unexpected error:", error);
  throw new Error("Unexpected error occurred. Check console for details.");
};

// --- API Service Functions ---

// 🔹 Get All Sale Return Invoices (Operation 1) WITH DATE FILTERS
export const getreturnFarmInvoices = async (startDate?: string, endDate?: string) => {
  const module_id = getModuleId();

  try {
    const res = await axios.post(API_URL, {
      operation: 1,
      module_id,  // Add end_date parameter
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Create Sale Return Invoice (Operation 2)
export const createreturnFarmInvoice = async (
  sales_invoice_id: number,
  invoice_date: string,
  return_date: string,
  return_qty: number,
  discount: number,
  tax: number,
  module_id: number,
  company_id: number,
  branch_id: number,
  flock_id: number,
  total_qty: number,
  total_amount: number,
  remarks: string,
  created_by: number,
  items: {
    item_id: number;
    returned_qty: number;
    unit_price: number;
    discount: number;
    tax: number;
    uom: number;
  }[]
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      sales_invoice_id,
      invoice_date,
      return_date,
      return_qty,
      discount,
      tax,
      module_id,
      company_id,
      branch_id,
      flock_id,
      total_qty,
      total_amount,
      remarks,
      created_by,
      items,
    });

    // Expected Response: { success: true, message: "Return created successfully" }
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Approve Farm Invoices Return (Operation 5) - UPDATED to use sales_return_ids
export const approveFarmInvoicesReturn = async (sales_return_ids: number[]) => {
  const module_id = getModuleId();
  const user_id = getCurrentUserId();
  
  try {
    const res = await axios.post(API_URL, {
      operation: 5,      
      module_id,                           // current branch/module context
      updated_by: user_id,                 // current user performing approval
      sales_return_ids,                    // array of sales_return_ids to approve
    });

    return res.data.data; // returns the updated invoices list
  } catch (error) {
    handleApiError(error);
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