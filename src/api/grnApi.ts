import axios from "axios";

const API_URL = "http://84.16.235.111:2149/api/grn";
const PO_API_URL = "http://84.16.235.111:2149/api/getPOdetail"; // adjust backend URL
const grn_detail_API_URL = "http://84.16.235.111:2149/api/getGRNdetail"; // adjust backend URL

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
// 🔹 Insert GRN (with JSON items)
export const createGRN = async (
  po_id: number,
  vendor_id: number,
  created_by: number,
  remarks: string,
  items: { item_id: number; ordered_qty: number; received_qty: number; rejected_qty: number; unit_price: number }[]
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2, // Assuming operation 2 is for insertion
      po_id,
      vendor_id,
      created_by,
      remarks,
      items, // Convert array to JSON
    });

    // Backend expected: { success: true, po_id: 123, message: "PO created successfully" }
    return res.data.data ;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Get All GRNs
export const getGRNs = async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1 });
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
