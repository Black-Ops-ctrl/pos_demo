import axios from "axios";
const Items_API_URL = "http://84.16.235.111:2140/api/items";
const API_URL = "http://84.16.235.111:2140/api/so";

const image_URL = "http://84.16.235.111:2140/api/company";

import { getCurrentUserId } from "@/components/security/LoginPage";

// --- Utility Functions ---

const getModuleId = (): string | null => {
  return sessionStorage.getItem('selectedBranchId');
};

const module_id = getModuleId();
const user_id = getCurrentUserId();

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



export const getSaleInvoices = async (start_date?: string, end_date?: string) => {
  const module_id = getModuleId(); 

  try {
    const payload: any = { 
      operation: 1,
      module_id,
      created_by:user_id
    };
    
   

    const res = await axios.post(API_URL, { 
      operation: 1,
      
      
      start_date: start_date, // Add start_date parameter
      end_date: end_date   ,   // Add end_date parameter
      created_by:user_id,
      module_id: module_id
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};



// 🔹 Insert Sale Invoice (Operation 2)
export const createSalesInvoice = async (
  invoice_date: Date,
  status: string,
  vehicle_no: string,
  remarks: string,
  created_by: number,
  total_amount: number,
  company_id: number,
  branch_id: number,
  flock_id: number,
  items: {
    item_id: number;
    quantity: number;
    unit_price: number;
    discount_percentage: number;
    discount_amount: number;
    tax: number;
  }[]
) => {
  const module_id = getModuleId();

  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      module_id,
      company_id,    
      branch_id,  
      flock_id,   
      invoice_date,
      status,
      vehicle_no,
      remarks,
      created_by:user_id,
      total_amount,
      items         
    });

    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Update Sale Invoice (Operation 7)
export const updateSalesInvoice = async (
  sales_invoice_id: number,
  invoice_date: Date,
  status: string,
  vehicle_no: string,
  remarks: string,
  updated_by: number,
  total_amount: number,
  company_id: number,
  branch_id: number,
  flock_id: number,
  items: {
    item_id: number;
    quantity: number;
    unit_price: number;
    discount_percentage: number;
    discount_amount: number;
    tax: number;
  }[]
) => {
  const module_id = getModuleId();

  try {
    const res = await axios.post(API_URL, {
      operation: 7,
      module_id,
      sales_invoice_id,
      company_id,    
      branch_id,  
      flock_id,   
      invoice_date,
      status,
      vehicle_no,
      remarks,
      updated_by,
      total_amount,
      items         
    });

    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Delete Sale Invoice (Operation 3)
export const deleteSalesInvoice = async (sales_invoice_id: number) => {
  const module_id = getModuleId();

  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      sales_invoice_id: sales_invoice_id,
      module_id: module_id,
    });

    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Approve Sale Invoices (Operation 4)
export const approveSaleInvoices = async (selectedInvoices: number[]) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 4,      
      updated_by: user_id,
      module_id,
      sales_invoice_ids: selectedInvoices,
    });

    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Unapprove Sale Invoices (Operation 5)
export const unapproveSaleInvoices = async (selectedInvoices: number[]) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 5,      
      module_id,
      sales_invoice_ids: selectedInvoices,
    });

    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Return Sale Invoices (Operation 8)
export const ReturnSaleInvoices = async (selectedInvoices: number[]) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 8,      
      module_id,
      sales_invoice_ids: selectedInvoices,
    });

    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Get Return Sale Invoices (Operation 6)
export const getReturnSaleInvoices = async () => {
  const module_id = getModuleId(); 

  try {
    const res = await axios.post(API_URL, { 
      operation: 6,
      module_id,  
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Get Items for Discount (Operation 1)
export const getItemsfordiscount = async (branch_id: number) => {
  const module_id = getModuleId();
 
  try {
    const res = await axios.post(Items_API_URL, { 
      operation: 1,
      module_id,
      branch_id,
    });
    console.log("API Response for branch", branch_id, ":", res.data);
    return res.data.data;
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