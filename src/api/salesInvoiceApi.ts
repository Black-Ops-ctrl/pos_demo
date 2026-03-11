// /Users/imac/Downloads/Projects/POS/src/api/salesInvoiceApi.ts
import { getCurrentUserId } from "@/components/security/LoginPage";
import axios from "axios";

const API_URL = "http://84.16.235.111:2140/api/sales-invoices";
const user_id = getCurrentUserId();

/**
 * Retrieves the 'module_id' (which corresponds to 'selectedBranchId') from sessionStorage
 */
const getModuleId = (): string | null => {
  return sessionStorage.getItem('selectedBranchId');
};

// 🔹 Centralized error handler
const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      throw new Error(error.response.data?.message || `API Error: ${error.response.status}`);
    } else if (error.request) {
      throw new Error("No response from server. Please check your connection.");
    }
  }
  throw new Error("An unexpected error occurred.");
};

// 🔹 Get All Sales Invoices (Operation 1)
export const getSaleInvoices = async (startDate?: string, endDate?: string) => {
  try {
    const module_id = getModuleId();
    const requestData: any = { 
      operation: 1, 
      module_id,
      created_by: user_id
    };
    
    if (startDate && endDate) {
      requestData.start_date = startDate;
      requestData.end_date = endDate;
    }
    
    const res = await axios.post(API_URL, requestData);
    
    // Handle different response structures
    if (Array.isArray(res.data)) {
      return res.data;
    } else if (res.data?.data) {
      return res.data.data;
    }
    return [];
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

// 🔹 Create Sales Invoice (Operation 2)
export const createSalesInvoice = async (
  customer_id: number,
  invoice_date: Date,
  remarks: string,
  total_amount: number,
  commission_amount: number,
  company_id: number | null,
  branch_id: number | null,
  items: Array<{
    item_id: number;
    quantity: number;
    unit_price: number;
    discount_percentage: number;
    discount_amount: number;
    tax: number;
    extra_discount: number;
    commission_percentge: number;
    commission_amount: number;
  }>,
  payment_method?: string,
  received_amount?: number,
  payback?: number,
  source: 'POS' | 'MANUAL' = 'MANUAL'
) => {
  try {
    const module_id = getModuleId();
    
    // Format date as YYYY-MM-DD
    const formattedDate = invoice_date instanceof Date 
      ? invoice_date.toISOString().split('T')[0]
      : invoice_date;
    
    const requestData = {
      operation: 2,
      customer_id,
      invoice_date: formattedDate,
      created_by: user_id,
      module_id,
      company_id,
      branch_id,
      remarks,
      total_amount,
      commission_amount,
      payment_method,
      received_amount,
      payback,
      source,
      items,
    };
    
    const res = await axios.post(API_URL, requestData);
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// 🔹 Update Sales Invoice (Operation 3)
export const updateSalesInvoice = async (
  sales_invoice_id: number,
  customer_id: number,
  invoice_date: Date,
  remarks: string,
  total_amount: number,
  commission_amount: number,
  company_id: number,
  branch_id: number,
  items: Array<{
    item_id: number;
    quantity: number;
    unit_price: number;
    discount_percentage: number;
    discount_amount: number;
    tax: number;
    extra_discount: number;
    commission_percentge: number;
    commission_amount: number;
  }>
) => {
  try {
    const module_id = getModuleId();
    
    const formattedDate = invoice_date instanceof Date 
      ? invoice_date.toISOString().split('T')[0]
      : invoice_date;
    
    const requestData = {
      operation: 3,
      sales_invoice_id,
      customer_id,
      invoice_date: formattedDate,
      updated_by: user_id,
      module_id,
      company_id,
      branch_id,
      remarks,
      total_amount,
      commission_amount,
      items,
    };
    
    const res = await axios.post(API_URL, requestData);
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// 🔹 Approve Multiple Sales Invoices (Operation 4)
export const approveSaleInvoices = async (sales_invoice_ids: number[]) => {
  try {
    const module_id = getModuleId();
    const requestData = {
      operation: 4,
      updated_by: user_id,
      module_id,
      sales_invoice_ids,
    };
    
    const res = await axios.post(API_URL, requestData);
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// 🔹 Unapprove Sales Invoices (Operation 5)
export const unapproveSaleInvoices = async (sales_invoice_ids: number[]) => {
  try {
    const module_id = getModuleId();
    const requestData = {
      operation: 5,
      updated_by: user_id,
      module_id,
      sales_invoice_ids,
    };
    
    const res = await axios.post(API_URL, requestData);
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// 🔹 Delete Sales Invoice (Operation 6)
export const deleteSalesInvoice = async (sales_invoice_id: number) => {
  try {
    const module_id = getModuleId();
    const requestData = {
      operation: 3,
      sales_invoice_id,
      module_id,
      updated_by: user_id
    };
    
    const res = await axios.post(API_URL, requestData);
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// 🔹 Get Company Image/Info
export const getCompanyimg = async () => {
  try {
    const image_URL = "http://84.16.235.111:2140/api/company";
    const requestData = { operation: 1 };
    
    const res = await axios.post(image_URL, requestData);
    return res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};