import axios from "axios";
import { getCurrentUserId } from "@/components/security/LoginPage";

const API_URL = "http://84.16.235.111:2135/api/journal-entries";


const image_URL = "http://84.16.235.111:2135/api/company";


const getModuleId = (): string => {
  return sessionStorage.getItem('selectedBranchId') || 'N/A';
};

const module_id = getModuleId();
//const user_id = getCurrentUserId();

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







export const getJournalEntries = async (voucher_id: number, startDate?: string, endDate?: string) => {
  try {
       const user_id = getCurrentUserId();
    
    if (!user_id) {
      throw new Error("User not authenticated. Please log in again.");
    }
    const res = await axios.post(API_URL, { 
      operation: 1,
      voucher_id: voucher_id,
     // module_id: module_id,
      start_date: startDate, // Add start_date parameter
      end_date: endDate   ,   // Add end_date parameter
      created_by:user_id
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};












// 🔹 Create Journal Entry (with expense_id)
export const createJournalEntry = async (
voucher_id: number, 
branch_id: number,
// expense_id: number,
  entry_date: Date, 
  description: string,
   
   lines: {
  account_id: number;
  item_id: number;
  quantity: number;
  rate: number;
  debit: number;
  credit: number;
  description: string;
}[]) => {
  try {
     const user_id = getCurrentUserId();
    
    if (!user_id) {
      throw new Error("User not authenticated. Please log in again.");
    }
    const res = await axios.post(API_URL, {
      operation: 2, // Assuming operation 2 is for insertion
      voucher_id,
      branch_id,
     
    //  expense_id, // Added expense_id to payload
      entry_date: entry_date.toISOString().split('T')[0],
      description,
     // module_id,
      created_by: user_id,
      lines // Convert array to JSON
    });

    // Backend expected: { success: true, so_id: 123, message: "SO created successfully" }
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Update Journal Entry (with expense_id)
export const updateJournalEntry = async (
journal_entry_id: number, 
voucher_id: number, 
branch_id: number, 
//flock_id: number, 
//expense_id: number, 
entry_date: string,
 description: string, 
 lines: {
  account_id: number;
  item_id: number;
  quantity: number;
  rate: number;
  debit: number;
  credit: number;
  description: string;
}[]) => {
  try {
     const user_id = getCurrentUserId();
    
    if (!user_id) {
      throw new Error("User not authenticated. Please log in again.");
    }
    const res = await axios.post(API_URL, {
      operation: 3, // update
      journal_entry_id,
      voucher_id,
      branch_id,
     // flock_id,
     // expense_id, // Added expense_id to payload
      entry_date,
      description,
      updated_by: user_id,
    //  module_id, // Added module_id for consistency
      lines
    });
    
    console.log("Submitting payload:", {
      journal_entry_id,
      voucher_id,
      branch_id,
    //  flock_id,
//expense_id,
      entry_date,
      description
    });
    
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

//🔹 Approve Multiple Journal Entries (Bulk Status Update)
export const approveJournalEnrtries = async (journal_entry_ids: number[]) => {
  try {
     const user_id = getCurrentUserId();
    
    if (!user_id) {
      throw new Error("User not authenticated. Please log in again.");
    }
    const res = await axios.post(API_URL, {
      operation: 4,                        // 4 = Approve operation
      updated_by: user_id,                 // current user performing approval
    //  module_id,                           // current branch/module context
      journal_entry_ids,                   // array of IDs to approve
    });

    return res.data; // returns the updated invoices list
  } catch (error) {
    handleApiError(error);
  }
};

//🔹 Unapprove Multiple Journal Entries (Bulk Status Update)
export const UnapproveJournalEnrtries = async (journal_entry_ids: number[]) => {
  try {
     const user_id = getCurrentUserId();
    
    if (!user_id) {
      throw new Error("User not authenticated. Please log in again.");
    }
    const res = await axios.post(API_URL, {
      operation: 5,                        // 5 = Unapprove operation
      updated_by: user_id,                 // current user performing approval
    //  module_id,                           // current branch/module context
      journal_entry_ids,                   // array of IDs to unapprove
    });

    return res.data; // returns the updated invoices list
  } catch (error) {
    handleApiError(error);
  }
};

//🔹 Delete Journal Entry
export const deleteJournalEntry = async (journal_entry_id: number) => {
  try {
    const res = await axios.post(API_URL, { 
      operation: 6, // delete
      journal_entry_id
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};




export const getCompanyimg = async () => {
  try {
    const res = await axios.post(image_URL, { 
      operation: 1
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};