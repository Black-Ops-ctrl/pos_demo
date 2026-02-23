// src/api/ExpenseApi.ts  <-- (Recommended change from departmentApi.ts to reflect content)
import axios from "axios";

const API_URL = "http://84.16.235.111:2135/api/expense";

// 💡 Helper to get the module_id from session storage
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

// --- API Functions for Expense Management ---

// 1️⃣ Get all Expense (Used for listing and likely for dropdown in the Branch form)
export const getExpense = async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1 });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 2️⃣ Add Expense
export const addExpense = async (
  expense_name: string
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      expense_name
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 3️⃣ Update Expense
export const updateExpense = async (
  expense_id: number,
  expense_name: string
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
                 

      expense_id,

      expense_name
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 4️⃣ Delete Expense
export const deleteExpense = async (expense_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 4,
      expense_id
    });
    return res.data; 
  } catch (error) {
    handleApiError(error);
  }
};

