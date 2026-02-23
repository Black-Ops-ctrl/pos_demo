import axios from "axios";

const API_URL = "http://84.16.235.111:2135/api/pos";

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
// 🔹 Get All POS
export const getPOS = async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1 });
    return res.data.data ;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Insert POS (with JSON items)
export const createPOS = async (
  payment_method: string,
  total_discount: number,
  total_tax: number,
  total_amount: number,
  created_by: number,
  items: { item_id: number; qty: number; unit_price: number, tax: number }[]
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2, // Assuming operation 2 is for insertion
        payment_method,
      total_discount,
      total_tax,
      total_amount,
      created_by,
      items, // Convert array to JSON
    });

    // Backend expected: { success: true, po_id: 123, message: "PO created successfully" }
    return res.data.data ;
  } catch (error) {
    handleApiError(error);
  }
};



