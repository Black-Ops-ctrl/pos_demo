import axios from "axios";

const API_URL = "http://84.16.235.111:2091/api/purchase-orders";
import { getCurrentUserId } from "@/components/security/LoginPage";
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
export const getPurchaseOrders = async () => {
  const module_id = getModuleId(); // 🔑 Module_id added
  try {
    const res = await axios.post(API_URL, { 
      operation: 1,
      module_id, // Sending module_id
    });
    return res.data.data ;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Insert Purchase Order (with JSON items)
export const createPurchaseOrder = async (
  vendor_id: number,
  items: {
    item_id: number; quantity: number; unit_price: number 
  }[]
) => {
  const module_id = getModuleId(); // 🔑 Module_id added
  try {
    const res = await axios.post(API_URL, {
      operation: 2, // Assuming operation 2 is for insertion
      module_id, // Sending module_id
      vendor_id,
      user_id,
      items, // Convert array to JSON
    });

    // Backend expected: { success: true, po_id: 123, message: "PO created successfully" }
    return res.data.data ;
  } catch (error) {
    handleApiError(error);
  }
};


// 🔹 Update Complete Purchase Order
export const updatePurchaseOrder = async (
  po_id: number,
  vendor_id: number,
  status: string,
  items: { item_id: number; quantity: number; unit_price: number }[]
) => {
  const module_id = getModuleId(); // 🔑 Module_id added
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      module_id, // Sending module_id
      po_id,
      vendor_id,
      status,
      user_id,
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
  const module_id = getModuleId(); // 🔑 Module_id added
  try {
    const res = await axios.post(API_URL, {
      operation: 4,
      module_id, // Sending module_id
      po_ids,
      status,
      user_id,
    });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};