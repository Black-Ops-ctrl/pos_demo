import axios from "axios";

const API_URL = "http://84.16.235.111:2135/api/purchase-requisitions";

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


// 🔹 Get All Purchase Requisitions
export const getPRs = async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1 });
    return res.data ;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Insert Purchase Requisition (with JSON items)
export const createPR = async (
  created_by: number | null,
  status: string | null,
  remarks: string | null,
  item_id: number | null,
  qty: number | null,
  approved_by: number | null,
  dep_id: number | null
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2, // Assuming operation 2 is for insertion
      created_by,
      status,
      remarks,
      item_id,
      qty,
      approved_by,
      dep_id
    });

    // Backend expected: { success: true, po_id: 123, message: "PO created successfully" }
    return res.data ;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Update Purchase Requisition
export const updatePR = async (
    
  pr_id: number,
  created_by: number | null,
  status: string | null,
  remarks: string | null,
  item_id: number | null,
  qty: number | null,
  approved_by: number | null,
  dep_id: number | null
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      pr_id,
      created_by,
      status,
      remarks,
      item_id,
      qty,
      approved_by,
      dep_id
    });
    return res.data ;
  } catch (error) {
    handleApiError(error);
  }
};
//  Delete Purchase Requisition
export const deletePR = async (pr_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 4,
      pr_id,
    });
    return res.data ; 
  } catch (error) {
    handleApiError(error);
  }
};



