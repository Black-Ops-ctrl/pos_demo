import axios from "axios";

const API_URL = "http://84.16.235.111:2140/api/sales-orders";
const GET_CUSTOMERS_API_URL = "http://84.16.235.111:2140/api/getcustomers";

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
// 🔹 Get All SOs
export const getSOs = async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1 });
    return res.data ;
  } catch (error) {
    handleApiError(error);
  }
};
// 🔹 Insert SO (with JSON items)
export const createSO = async (
  customer_id: number,
  order_date: Date,
  delivery_date: Date,
  shipping_address: string,
  payment_term: string,
  discount: number,
  tax: number,
  total_amount: number,
  created_by: number,
  items: { item_id: number; quantity: number; unit_price: number; discount: number; tax: number }[]
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2, // Assuming operation 2 is for insertion
      customer_id,
      order_date,
      delivery_date,
      shipping_address,
      payment_term,
      discount,
      tax,
      total_amount,
      created_by,
      items, // Convert array to JSON
    });

    // Backend expected: { success: true, so_id: 123, message: "SO created successfully" }
    return res.data.data ;
  } catch (error) {
    handleApiError(error);
  }
};
//  Update SO (operation = 3)
export const updateSO = async (
so_id: number, customer_id: number, order_date: Date, delivery_date: Date, shipping_address: string, payment_term: string, discount: number, tax: number, total_amount: number, created_by: number, items: { item_id: number; quantity: number; unit_price: number; discount: number; tax: number; }[]) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      so_id,
      customer_id,
      order_date,
      delivery_date,
      shipping_address,
      payment_term,
      discount,
      tax,
      total_amount,
      created_by,
      items,
    });
    return res.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

//  Delete SO
export const deleteSO = async (so_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 4,
      so_id,
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
//  Get SO By ID
export const getSOById = async (so_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 5,
      so_id,
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
//  Get Customers for dropdown
export const getCustomers = async () => {
  const res = await axios.get(GET_CUSTOMERS_API_URL);
  return res.data; // [{ customer_id, customer_name }]
};
