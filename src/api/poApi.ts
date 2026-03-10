/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
const Items_API_URL = "http://84.16.235.111:2140/api/items";

const vendor_new ="http://84.16.235.111:2140/api/getvendors";

const API_URL = "http://84.16.235.111:2140/api/purchase-orders";
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

// 🔹 Get All Purchase Orders - UPDATED to handle missing uom_name
export const getPurchaseOrders = async (startDate?: string, endDate?: string) => {
  const module_id = getModuleId(); 
  try {
    const res = await axios.post(API_URL, { 
      operation: 1,
      module_id,
      start_date: startDate, 
      end_date: endDate,
      created_by: user_id
    });
    
    console.log("Raw API Response:", res.data);
    
    // Ensure we're returning the data in the correct format
    const purchaseOrders = res.data.data || [];
    
    // Log to see what we're getting
    if (purchaseOrders.length > 0) {
      console.log("Sample PO items structure:", purchaseOrders[0].items);
      
      // Check if uom_name exists in the response
      if (purchaseOrders[0].items && purchaseOrders[0].items.length > 0) {
        const firstItem = purchaseOrders[0].items[0];
        console.log("First item fields:", Object.keys(firstItem));
        console.log("uom_name present?", firstItem.hasOwnProperty('uom_name'));
      }
    }
    
    return purchaseOrders;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Insert Purchase Order - UPDATED to include item details
export const createPurchaseOrder = async (
  branch_id: number,
  flock_id: number,
  vendor_id: number,
  total_amount: number,
  items: {
    item_id: number; 
    item_name?: string;
    item_code?: string;
    quantity: number; 
    unit_price: number;
    uom_id?: number;
    uom_name?: string;
    discount: number;
    discount_percentage: number;
  }[],
  order_date: string,
  vehicle_no?: string
) => {
  const module_id = getModuleId();
  try {
    // Log what we're sending to help debug
    console.log("Sending to API:", {
      operation: 2,
      order_date,
      branch_id,
      flock_id, 
      vendor_id,
      total_amount,
      module_id,
      created_by: user_id,
      vehicle_no,
      items: items.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name || '',
        item_code: item.item_code || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        uom_id: item.uom_id,
        uom_name: item.uom_name || '',
        discount: item.discount,
        discount_percentage: item.discount_percentage
      }))
    });

    const res = await axios.post(API_URL, {
      operation: 2,
      order_date,
      branch_id,
      flock_id, 
      vendor_id: vendor_id,
      total_amount,
      module_id: module_id,
      created_by: user_id,
      vehicle_no,
      items: items.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name || '',     
        item_code: item.item_code || '',     
        quantity: item.quantity,
        unit_price: item.unit_price,
        uom_id: item.uom_id,
        uom_name: item.uom_name || '',     
        discount: item.discount,
        discount_percentage: item.discount_percentage
      })),
    });

    console.log("Create PO Response:", res.data);
    return res.data.data;
  } catch (error) {
    console.error("Create PO Error:", error);
    handleApiError(error);
  }
};

// 🔹 Update Purchase Order - UPDATED to include item details
export const updatePurchaseOrder = async (
  po_id: number,
  branch_id: number,
  flock_id: number,
  vendor_id: number,
  status: string,
  total_amount: number,
  items: { 
    item_id: number; 
    item_name?: string;        
    item_code?: string;       
    quantity: number; 
    unit_price: number;
    uom_id?: number;
    uom_name?: string;         
    discount: number;
    discount_percentage?: number;
  }[],
  order_date: string,
  vehicle_no?: string
) => {  
  const module_id = getModuleId();
  try {
    console.log("Updating PO with items:", items.map(item => ({
      item_id: item.item_id,
      item_name: item.item_name,
      uom_id: item.uom_id,
      uom_name: item.uom_name
    })));

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
      order_date,
      vehicle_no,
      items: items.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name || '',     
        item_code: item.item_code || '',     
        quantity: item.quantity,
        unit_price: item.unit_price,
        uom_id: item.uom_id,
        uom_name: item.uom_name || '',       
        discount: item.discount,
        discount_percentage: item.discount_percentage
      })),
    });
    return res.data.data;
  } catch (error) {
    console.error("Update PO Error:", error);
    handleApiError(error);
  }
};

// 🔹 Bulk Update Purchase Order Statuses - FIXED with updated_by
export const UpdatePOStatus = async (
  po_ids: number[],
  status: string
) => {
  const module_id = getModuleId();
  const current_user_id = getCurrentUserId();
  
  try {
    console.log("UpdatePOStatus called with:", { po_ids, status, module_id, updated_by: current_user_id });
    
    const res = await axios.post(API_URL, {
      operation: 4,
      module_id: module_id,
      po_ids,
      status,
      updated_by: current_user_id, // ✅ Added updated_by
      user_id: current_user_id      // Keeping user_id for backward compatibility
    });
    
    console.log("UpdatePOStatus response:", res.data);
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Update New Purchase Order Status - FIXED with updated_by
export const UpdateNewPOStatus = async (
  po_ids: number[],
  status: string
) => {
  const module_id = getModuleId();
  const current_user_id = getCurrentUserId();
  
  try {
    console.log("UpdateNewPOStatus called with:", { po_ids, status, module_id, updated_by: current_user_id });
    
    const res = await axios.post(API_URL, {
      operation: 5,
      module_id: module_id,
      po_ids,
      status,
      updated_by: current_user_id, // ✅ Added updated_by
      user_id: current_user_id      // Keeping user_id for backward compatibility
    });
    
    console.log("UpdateNewPOStatus response:", res.data);
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

// 🔹 Get Items for Discount
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

export const getnewVendors = async () => {
  try {
    const res = await axios.post(vendor_new, {});
    console.log("API Response:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getPurchaseOrdersinvoice = async () => {
   const module_id = getModuleId();
  try {
    const res = await axios.post(API_URL, { operation: 6, module_id: module_id });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};