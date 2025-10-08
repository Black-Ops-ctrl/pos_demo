import axios from "axios";

const API_URL = "http://84.16.235.111:2091/api/journal-entries";

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
// 🔹 Get All Journal Entry
export const getJournalEntries = async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1 });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
// 🔹 Insert Sale Invoice (with JSON items)
export const createJournalEntry = async (
   
  voucher_id:number,
  entry_date: Date,
  description: string,
  created_by: number,
 
  lines: { account_id: number; debit: number; credit: number; description: string }[]
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2, // Assuming operation 2 is for insertion
      
      voucher_id,
      entry_date,
      description,
      created_by,
     
      lines // Convert array to JSON
    });

    // Backend expected: { success: true, so_id: 123, message: "SO created successfully" }
    return res.data ;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateJournalEntry = async (
  journal_entry_id: number,
  voucher_id: number,
  entry_date: string,
  description: string,
  updated_by: number,
  lines:  { account_id: number; debit: number; credit: number; description: string }[]
) => {
  const response = await axios.post(API_URL, {
    operation: 3,   // update
    journal_entry_id,
    voucher_id,
    entry_date,
    description,
    updated_by,
    lines
  });
  return response.data;
};