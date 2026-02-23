import axios from "axios";

const API_URL = "http://84.16.235.111:2135/api/items";
const Sale_Items_Accounts_API_URL = "http://84.16.235.111:2135/api/getSaleItemsAccounts";
const Puchase_Items_Accounts_API_URL = "http://84.16.235.111:2135/api/getPurchaseItemsAccounts";

/**
 * Retrieves the 'module_id' (which corresponds to 'selectedBranchId') from sessionStorage.
 * This ensures the correct branch context is sent with every API request.
 * @returns {string} The selected branch ID or 'N/A' if not found.
 */
// const getModuleId = (): string => {
//  // Use 'selectedBranchId' as the module_id for API operations
//  return sessionStorage.getItem('selectedBranchId') || 'N/A';
// };

// Centralized error handler
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

// --- API Functions Updated with module_id and uom_id ---

// Get Items
export const getItems = async () => {
 
 try {
  const res = await axios.post(API_URL, { 
   operation: 1,
  });
  console.log("API Response:", res.data);
  return res.data.data;
 } catch (error) {
  handleApiError(error);
 }
};

// Get Items for Discount - FIXED: Use module_id instead of branch_id
export const getItemsfordiscount = async () => {
 
 try {
  const res = await axios.post(API_URL, { 
   operation: 1,
  });
  console.log("API Response:", res.data);
  return res.data.data;
 } catch (error) {
  handleApiError(error);
 }
};

export const getSaleItemsAccounts = async () => {
 const response = await axios.get(Sale_Items_Accounts_API_URL);
 return response.data;
};

export const getPurchaseItemsAccounts = async () => {
 const response = await axios.get(Puchase_Items_Accounts_API_URL);
 return response.data;
};

// Add Item
export const addItem = async (
 item_name: string,
 description: string,
 category: number,
 purchase_account_id: number,
 sale_account_id: number,
 uom_id: number, // 🎯 CHANGED from unit: string to uom_id: number
 price: number
) => {
 
 try {
  const res = await axios.post(API_URL, {
   operation: 2,
   item_name,
   description,
   category,
   purchase_account_id,
   sale_account_id,
   uom_id, // 🎯 CHANGED: Pass uom_id
   price,
  });
  // Backend returns: { success: true, message: "Item added successfully" }
  return res.data;
 } catch (error) {
  handleApiError(error);
 }
};

// 🔹 Update Item
export const updateItem = async (
 item_id: number,
 item_name: string,
 description: string,
 category: number,
 purchase_account_id: number,
 sale_account_id: number,
 uom_id: number, // 🎯 CHANGED from unit: string to uom_id: number
 price: number,
) => {

 try {
  const res = await axios.post(API_URL, {
   operation: 3,
   item_id,
   item_name,
   description,
   category,
   purchase_account_id,
   sale_account_id,
   uom_id, // 🎯 CHANGED: Pass uom_id
   price,
  });
  return res.data ;
 } catch (error) {
  handleApiError(error);
 }
};

// Delete Item
export const deleteItem = async (item_id: number) => {

 try {
  const res = await axios.post(API_URL, {
   operation: 4,
   item_id,
  });
  return res.data ; 
 } catch (error) {
  handleApiError(error);
 }
};