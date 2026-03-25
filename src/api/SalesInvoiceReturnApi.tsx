import axios from "axios";

const API_URL = "http://84.16.235.111:2149/api/sales-invoices-return";
import { getCurrentUserId } from "@/components/security/LoginPage";

// --- Utility Functions ---

const getModuleId = (): string | null => {
  return sessionStorage.getItem('selectedBranchId');
};

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

// --- API Service Functions ---

// 🔹 Get All Sale Invoices Return (Operation 1)
export const getSalesInvoicesReturn = async () => {
  const module_id = getModuleId(); 

  try {
    const res = await axios.post(API_URL, { 
      operation: 1,
      module_id,  
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// In your API file (SalesInvoiceReturnApi.js)
export const createSalesInvoiceReturn = async (
  sales_return_id:number,
  customer_id: number,
  invoice_date: string,
  return_date: string,
  return_qty: number,
  discount: number,
  tax: number,
  company_id: number,
  branch_id: number,
  total_qty: number,
  total_amount: number,
  remarks: string,
  items: {
    item_id: number;
    returned_qty: number;
    unit_price: number;
    discount: number;
    tax: number;
    uom: number;
  }[]
) => {
  const module_id = getModuleId();
  const user_id = getCurrentUserId();
  
  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      sales_return_id, // Use 0 for new records
      customer_id,
      invoice_date,
      return_date,
      return_qty,
      discount,
      tax,
      module_id,
      company_id,
      branch_id,
      total_qty,
      total_amount,
      remarks,
      items,
      created_by: user_id
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Update Sale Invoice Return (Operation 3)
export const updateSalesInvoiceReturn = async (
  sales_return_id: number,
  customer_id: number,
  invoice_date: string,
  return_date: string,
  return_qty: number,
  discount: number,
  tax: number,
  company_id: number,
  branch_id: number,
  total_qty: number,
  total_amount: number,
  remarks: string,
  items: {
    item_id: number;
    returned_qty: number;
    unit_price: number;
    discount: number;
    tax: number;
    uom: number;
  }[]
) => {
  const module_id = getModuleId();
  const user_id = getCurrentUserId();
  
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      sales_return_id,
      customer_id,
      invoice_date,
      return_date,
      return_qty,
      discount,
      tax,
      module_id,
      company_id,
      branch_id,
      total_qty,
      total_amount,
      remarks,
      items,
      updated_by: user_id
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Approve Sale Invoices Return (Operation 5)
export const approveSalesInvoicesReturn = async (sales_return_ids: number[]) => {
  const module_id = getModuleId();
  const user_id = getCurrentUserId();
  
  try {
    const res = await axios.post(API_URL, {
      operation: 5,
      sales_return_ids,
      module_id,
      updated_by: user_id
    });

    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};
