import axios from "axios";

const API_URL = "http://84.16.235.111:2091/api/warehouses";

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

export const getwarehouses = async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1 });
   console.log("API Response:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
//  Add Warehouse
export const addWarehouse = async (
  warehouse_code: string,
  warehouse_name: string,
  address: string
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      warehouse_code,
      warehouse_name,
      address
    });
    
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Update Warehouse
export const updateWarehouse = async (
  warehouse_id: number,
  warehouse_code: string,
  warehouse_name: string,
  address: string
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      warehouse_id,
      warehouse_code,
      warehouse_name,
      address
      
    });
    return res.data ;
  } catch (error) {
    handleApiError(error);
  }
};

//  Delete Warehouse
export const deleteWarehouse = async (warehouse_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 4,
      warehouse_id,
    });
    return res.data ; 
  } catch (error) {
    handleApiError(error);
  }
};
