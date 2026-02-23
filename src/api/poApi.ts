import axios from "axios";
const Items_API_URL = "http://84.16.235.111:2135/api/items";



const vendor_new ="http://84.16.235.111:2135/api/getvendors";

const API_URL = "http://84.16.235.111:2135/api/purchase-orders";
import { getCurrentUserId } from "@/components/security/LoginPage";
const user_id = getCurrentUserId();

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

// 🔹 Get All Purchase Orders
export const getPurchaseOrders = async (startDate?: string, endDate?: string) => {
  const module_id = getModuleId(); 
  try {
    const res = await axios.post(API_URL, { 
      operation: 1,
      module_id,
      start_date: startDate, 
      end_date: endDate  ,
      created_by:user_id
    });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Insert Purchase Order (with JSON items) - UPDATED with new parameters
export const createPurchaseOrder = async (
  branch_id: number,
  flock_id: number,
  vendor_id: number,
  total_amount: number,
  items: {
    item_id: number; 
    quantity: number; 
    unit_price: number;
    uom_id?: number;
    discount: number;
    discount_percentage: number;
  }[],
  order_date: string, // ✅ NEW: Added order_date parameter
  vehicle_no?: string // ✅ NEW: Added optional vehicle_no parameter
) => {
  const module_id = getModuleId();
  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      order_date,
      branch_id,
      flock_id, 
      vendor_id: vendor_id,
      total_amount,
      module_id: module_id,
      created_by: user_id,
      vehicle_no, // ✅ NEW: Include vehicle_no in request (if provided)
      items,
    });

    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Update Complete Purchase Order - UPDATED with new parameters
export const updatePurchaseOrder = async (
  po_id: number,
  branch_id: number,
  flock_id: number,
  vendor_id: number,
  status: string,
  total_amount: number,
  items: { 
    item_id: number; 
    quantity: number; 
    unit_price: number;
    uom_id?: number;
    discount: number;
    discount_percentage?: number;
  }[],
  order_date: string, // ✅ NEW: Added order_date parameter
  vehicle_no?: string // ✅ NEW: Added optional vehicle_no parameter
) => {  
  const module_id = getModuleId();
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      branch_id,
      flock_id,
      po_id,
      vendor_id: vendor_id,
      total_amount,
      module_id: module_id, 
      status,
      updated_by: user_id,
      order_date, // ✅ NEW: Include order_date in request
      vehicle_no, // ✅ NEW: Include vehicle_no in request (if provided)
      items,
    });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Bulk Update Purchase Order Statuses
export const UpdatePOStatus = async (
  po_ids: number[],
  status: string
) => {
  const module_id = getModuleId();
  try {
    const res = await axios.post(API_URL, {
      operation: 4,
      module_id: module_id,
      po_ids,
      status,
      user_id,
    });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Update New Purchase Order Status
export const UpdateNewPOStatus = async (
  po_ids: number[],
  status: string
) => {
  const module_id = getModuleId();
  try {
    const res = await axios.post(API_URL, {
      operation: 5,
      module_id: module_id,
      po_ids,
      status,
      user_id,
    });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};
// 🔹 Delete Purchase Order
export const deletePurchaseOrder = async (po_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 7,
      po_id,
      updated_by: user_id
    });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};
// 🔹 Get Items for Discount - UPDATED with branch_id parameter
export const getItemsfordiscount = async (branch_id: number) => {
 const module_id = getModuleId();
 
 try {
  const res = await axios.post(Items_API_URL, { 
   operation: 1,
   module_id,
   branch_id, // 🔑 NEW: Pass the selected branch_id
  });
  console.log("API Response for branch", branch_id, ":", res.data);
  return res.data.data;
 } catch (error) {
  handleApiError(error);
 }
};



export const getnewVendors = async () => {
  try {
    const res = await axios.post(vendor_new, {}); // empty payload

    console.log("API Response:", res.data);
    return res.data;

  } catch (error) {
    handleApiError(error);
  }
};




export const getPurchaseOrdersinvoice= async () => {
   const module_id = getModuleId();

  try {
    const res = await axios.post(API_URL, { operation: 6,module_id: module_id });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};
