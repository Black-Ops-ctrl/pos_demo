import { getCurrentUserId } from "@/components/security/LoginPage";
import axios from "axios";

const API_URL = "http://84.16.235.111:2135/api/purchase-invoices";
const image_URL = "http://84.16.235.111:2135/api/company";
const Vehicle_URL = "http://84.16.235.111:2135/api/vehicles";
const PO_API_URL = "http://84.16.235.111:2135/api/getPOdetail";
const grn_detail_API_URL = "http://84.16.235.111:2135/api/getGRNdetail";
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
export const getPurchaseinvoices = async (startDate?: string, endDate?: string) => {
  try {
    const requestData: any = { 
      operation: 1, 
      module_id: module_id ,
      created_by:user_id
    };
    
    // Add date parameters if provided
    if (startDate && endDate) {
      requestData.start_date = startDate;
      requestData.end_date = endDate;
    }
    
    const res = await axios.post(API_URL, requestData);
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Fetch PO details by po_id
export const getPODetails = async (po_id) => {
  try {
    const response = await axios.post(`${PO_API_URL}`, { po_id, module_id });
    return response.data;
  } catch (error) {
    console.error("Error fetching PO details:", error);
    throw error;
  }
};

export const getGRNDetails = async (grn_id) => {
  try {
    const response = await axios.post(`${grn_detail_API_URL}`, { grn_id });
    return response.data;
  } catch (error) {
    console.error("Error fetching GRN details:", error);
    throw error;
  }
};

// 🔹 Insert Purchase Invoice (with JSON items)
export const createPurchaseInvoice = async (
  po_id: number,
  vendor_id: number,
  branch_id: number,
  flock_id: number,
  remarks: string,
  freight: number,
  vehicle_feed_check: string,
  vehicle_no: string, // ✅ Change from number to string
  invoice_date: Date,
  total_amount: number,
  items: {
    item_id: number;
    item_name: string;
    item_code: string;
    ordered_qty: number;
    received_qty: number;
    unit_price: number;
    discount: number;
    discount_percentage: number;
  }[]
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      po_id,
      vendor_id,
      branch_id,
      flock_id,
      created_by: user_id,
      module_id,
      remarks,
      freight,
      vehicle_feed_check,
      vehicle_no, // ✅ Ab yeh string format mein jayega
      invoice_date,
      total_amount,
      items,
    });

    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Similarly update the updatePurchaseInvoice function
export const updatePurchaseInvoice = async (
  purchase_invoice_id: number,
  po_id: number,
  vendor_id: number,
  branch_id: number,
  flock_id: number,
  remarks: string,
  freight: number,
  vehicle_feed_check: string,
  vehicle_no: string, // ✅ Change from number to string
  invoice_date: Date,
  total_amount: number,
  items: {
    item_id: number;
    item_name: string;
    item_code: string;
    ordered_qty: number;
    received_qty: number;
    unit_price: number;
    discount: number;
    discount_percentage: number;
  }[]
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      purchase_invoice_id,
      po_id,
      vendor_id,
      branch_id,
      flock_id,
      updated_by: user_id,
      module_id,
      remarks,
      freight,
      vehicle_feed_check,
      vehicle_no, // ✅ Ab yeh string format mein jayega
      invoice_date,
      total_amount,
      items,
    });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Approve Multiple Purchase Invoices (Bulk Status Update)
export const approvePurchaseInvoices = async (purchase_invoice_ids: number[]) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 4,
      updated_by: user_id,
      module_id,
      purchase_invoice_ids,
    });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const unapprovePurchaseInvoices = async (purchase_invoice_ids: number[]) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 5,
      updated_by: user_id,
      module_id,
      purchase_invoice_ids,
    });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Delete Purchase Invoice
export const deletePurchaseInvoice = async (purchase_invoice_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 6,
      purchase_invoice_id,
      module_id,
      updated_by: user_id
    });
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