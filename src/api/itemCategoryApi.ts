import axios from "axios";

const API_URL = "http://84.16.235.111:2140/api/itemCategories";



const getModuleId = (): string => {
  return sessionStorage.getItem('selectedBranchId') || 'N/A';
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

// 🔹 Get Item Categories
export const getItemCategory = async () => {
  try {
    const res = await axios.post(API_URL,{operation:1});
   console.log("API Response:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Add Item
export const addItemCategory = async (

  category_name: string,
  account_id: number,
  description: string,

) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      category_name,
      account_id,
      description
     
    });
    // Backend returns: { success: true, message: "Item added successfully" }
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Update Item
export const updateItemCategory = async (
  category_id: number,
  category_name: string,
  account_id: number,
  description: string
 
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      category_id,
      category_name,
      account_id,
      description
     
    });
    return res.data ;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Delete Item
export const deleteItemCategory = async (category_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 4,
      category_id
    });
    return res.data ; 
  } catch (error) {
    handleApiError(error);
  }
};
