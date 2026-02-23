import axios from "axios";
import { getCurrentUserId } from "@/components/security/LoginPage";
const Items_API_URL = "http://84.16.235.111:2135/api/items";


const image_URL = "http://84.16.235.111:2135/api/company";


const API_URL = "http://84.16.235.111:2135/api/sales-invoices";

const getModuleId = (): string | null => {
  return sessionStorage.getItem('selectedBranchId');
};  



//const user_id = getCurrentUserId();

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

// 🔹 Get All Sale Invoices (Operation 1)
export const getSaleInvoices = async (startDate?: string, endDate?: string) => {
  const module_id = getModuleId(); 

  try {
   
   
     const user_id = getCurrentUserId();
    
    if (!user_id) {
      throw new Error("User not authenticated. Please log in again.");
    }
      const res = await axios.post(API_URL, { 
      operation: 1, 
      start_date: startDate, 
      end_date: endDate   ,   
      created_by:user_id
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Insert Sale Invoice (Operation 2) - UPDATED: Changed discount to discount_percentage
export const createSalesInvoice = async (
  customer_id: number,
  invoice_date: Date, 
  remarks: string,
  
  total_amount: number,
  
  commission_amount:number,
  company_id: number,
  branch_id: number,
  items: {
    item_id: number;
    quantity: number;
    unit_price: number;
    discount_percentage: number; // CHANGED: discount to discount_percentage
    discount_amount: number;
    tax: number;
    extra_discount: number;
    commission_percentge: number;
    commission_amount: number;
  }[]
) => {
 const user_id = getCurrentUserId();
    
    if (!user_id) {
      throw new Error("User not authenticated. Please log in again.");
    }
  try {
    
    const tax = items.reduce(
      (sum, item) => sum + Number(item.tax || 0),
      0
    );
    const res = await axios.post(API_URL, {
      operation: 2,
      customer_id,
      remarks,
      created_by: user_id,
      tax,
      company_id,    
      branch_id, 
      total_amount,
      commission_amount,
      items         ,
       invoice_date,
    });

    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Delete Sale Invoice (Operation 3)
export const deleteSalesInvoice = async (sales_invoice_id: number) => {
  
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      sales_invoice_id: sales_invoice_id
    });

    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const approveSaleInvoices = async (selectedInvoices: number[]) => {
 
  
  try {
     const user_id = getCurrentUserId();
    
    if (!user_id) {
      throw new Error("User not authenticated. Please log in again.");
    }
    const res = await axios.post(API_URL, {
      operation: 4,      
      updated_by: user_id,
      
      sales_invoice_ids: selectedInvoices,
    });

    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const unapproveSaleInvoices = async (selectedInvoices: number[]) => {
  
  try {
    const res = await axios.post(API_URL, {
      operation: 5,      
     
      sales_invoice_ids: selectedInvoices,
    });

    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Update Sale Invoice (Operation 7) - UPDATED: Changed discount to discount_percentage
export const updateSalesInvoice = async (
  sales_invoice_id: number,
  customer_id: number,
  invoice_date: Date,
  remarks: string,
  total_amount: number,
  commission_amount,
  company_id: number,
  branch_id: number,
  
  items: {
    item_id: number;
    quantity: number;
    unit_price: number;
    discount_percentage: number; 
    discount_amount: number;
    tax: number;
    extra_discount: number;
    commission_percentge :number;
    commission_amount :number;
  }[]
) => {
 
  try {
     const user_id = getCurrentUserId();
    
    if (!user_id) {
      throw new Error("User not authenticated. Please log in again.");
    }
    const tax = items.reduce(
      (sum, item) => sum + Number(item.tax || 0),
      0
    );
    const res = await axios.post(API_URL, {
      operation: 7,
     
      customer_id,
     
      
      remarks,
      updated_by: user_id,
      tax,
       company_id,
      branch_id,
      
      total_amount,
      commission_amount,
      items,
       sales_invoice_id,
        invoice_date
    });   
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
}





// Get Items for Discount
export const getItemsfordiscount = async (branch_id: number) => {
 const module_id = getModuleId();
 
 try {
  const res = await axios.post(Items_API_URL, { 
   operation: 1,
   
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