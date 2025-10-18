import axios from "axios";

const API_URL = "http://84.16.235.111:2091/api/items";

/**
 * Retrieves the 'module_id' (which corresponds to 'selectedBranchId') from sessionStorage.
 * This ensures the correct branch context is sent with every API request.
 * @returns {string} The selected branch ID or 'N/A' if not found.
 */
const getModuleId = (): string => {
  // Use 'selectedBranchId' as the module_id for API operations
  return sessionStorage.getItem('selectedBranchId') || 'N/A';
};

//  Centralized error handler
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

// --- API Functions Updated with module_id ---

//  Get Items
export const getItems = async () => {
  const module_id = getModuleId(); // Get the branch/module ID
  
  try {
    const res = await axios.post(API_URL, { 
      operation: 1,
      module_id, // 🔑 Added module_id
    });
    console.log("API Response:", res.data);
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

//  Add Item
export const addItem = async (
  item_name: string,
  description: string,
  category: number,
  warehouse_id: number,
  unit: string,
  price: number
) => {
  const module_id = getModuleId(); // Get the branch/module ID
  
  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      module_id, // 🔑 Added module_id
      item_name,
      description,
      category,
      warehouse_id,
      unit,
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
  warehouse_id: number,
  unit: string,
  price: number,
) => {
  const module_id = getModuleId(); // Get the branch/module ID

  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      module_id, // 🔑 Added module_id
      item_id,
      item_name,
      description,
      category,
      warehouse_id,
      unit,
      price,
    });
    return res.data ;
  } catch (error) {
    handleApiError(error);
  }
};

//  Delete Item
export const deleteItem = async (item_id: number) => {
  const module_id = getModuleId(); // Get the branch/module ID

  try {
    const res = await axios.post(API_URL, {
      operation: 4,
      module_id, // 🔑 Added module_id
      item_id,
    });
    return res.data ; 
  } catch (error) {
    handleApiError(error);
  }
};