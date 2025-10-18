import { getCurrentUserId } from "@/components/security/LoginPage";
import axios from "axios";

const API_URL = "http://84.16.235.111:2091/api/purchase-invoices";
const PO_API_URL = "http://84.16.235.111:2091/api/getPOdetail"; // adjust backend URL
const grn_detail_API_URL = "http://84.16.235.111:2091/api/getGRNdetail"; // adjust backend URL
const user_id = getCurrentUserId();

/**
 * Retrieves the 'module_id' (which corresponds to 'selectedBranchId') from sessionStorage.
 * This ensures the correct branch context is sent with every API request.
 * @returns {string | null} The selected branch ID or null if not found.
 */
const getModuleId = (): string | null => {
  // Use 'selectedBranchId' as the module_id for API operations
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
export const getPurchaseinvoices = async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1,module_id:module_id });
    return res.data.data ;
  } catch (error) {
    handleApiError(error);
  }
};
// Fetch PO details by po_id
export const getPODetails = async (po_id) => {
  try {
    const response = await axios.post(`${PO_API_URL}`, { po_id });
    return response.data;
  } catch (error) {
    console.error("Error fetching PO details:", error);
    throw error;
  }
};
export const getGRNDetails = async (grn_id) => {
  try {
    const response = await axios.post(`${grn_detail_API_URL}`, { grn_id });
    return response.data; // { grn_id, po_id, vendor_name, creation_date, remarks, items }
  } catch (error) {
    console.error("Error fetching GRN details:", error);
    throw error;
  }
};

// 🔹 Insert Purchase Invoice(with JSON items)
export const createPurchaseInvoice = async (
  po_id: number,
  vendor_id: number,
  warehouse_id :number,
  
  remarks: string,
  invoice_date: Date,
  total_amount:number,
  items: {
     item_id: number; 
     item_name:string;
     item_code:string;
     ordered_qty: number;
      received_qty: number;
        unit_price: number }[]
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2, // Assuming operation 2 is for insertion
      po_id,
      vendor_id,
      warehouse_id,
      created_by:user_id,
      module_id,
      remarks,
       invoice_date,
       total_amount,
      items, // Convert array to JSON
    });

    // Backend expected: { success: true, po_id: 123, message: "PO created successfully" }
    return res.data.data ;
  } catch (error) {
    handleApiError(error);
  }
};


//    Update purchase Invoice 
export const updatePurchaseInvoice = async (
  purchase_invoice_id: number,
  po_id: number,
  vendor_id: number,
  warehouse_id: number,
  remarks: string,
  invoice_date: Date,
  total_amount:number,
  items: {
     item_id: number;
      item_name:string;
     item_code:string;
      ordered_qty: number; 
      received_qty: number;
       unit_price: number }[]
) => {
  try {
   
    const res = await axios.post(API_URL, {
      operation: 3,
      purchase_invoice_id,
      po_id,
      vendor_id,
      warehouse_id,
      updated_by: user_id,
      module_id,
      remarks,
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
      operation: 4,                        // 4 = Approve operation
      updated_by: user_id,                 // current user performing approval
      module_id,                           // current branch/module context
      purchase_invoice_ids,                // array of IDs to approve
    });

    return res.data.data; // returns the updated invoices list
  } catch (error) {
    handleApiError(error);
  }
};
// 🔹 Delete Purchase Invoice
export const deletePurchaseInvoice = async (purchase_invoice_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 5,                // 5 = Delete operation (as per your PostgreSQL function)
      purchase_invoice_id,         // ID of invoice to delete
      module_id,                   // current module/branch
      updated_by: user_id          // user performing delete
    });

    return res.data.data;          // return remaining invoices after deletion
  } catch (error) {
    handleApiError(error);
  }
};