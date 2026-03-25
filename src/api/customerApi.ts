import axios from "axios";

// 💡 CHANGE 1: Function to get the Branch ID from sessionStorage
const getSelectedBranchId = (): string | null => {
    return sessionStorage.getItem("selectedBranchId");
};

const API_URL = "http://84.16.235.111:2149/api/customers";
const SALES_PERSON_API_URL = "http://84.16.235.111:2149/api/salespersons";
import { getCurrentUserId } from "@/components/security/LoginPage";
const user_id = getCurrentUserId();

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

// Utility function to get the numeric module_id
const getModuleId = () => {
    const selectedBranchId = getSelectedBranchId();
    // Parse the ID to a number if it's not "N/A", otherwise set to null for the API
    const module_id = selectedBranchId && selectedBranchId !== 'N/A'
        ? parseInt(selectedBranchId, 10)
        : null;
    return module_id;
}


export const getCustomers = async () => {
  try {
    const res = await axios.post(API_URL, {
      operation: 1
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
export const addCustomer = async (
  customer_name: string,
  phone: string,
  email: string,
  address: string,
  city: string,
  status: string,

  payment_term: string,
  sales_person_id: number,
  account_id: number,

  ntn: string,
  reg_no: string,
  allow_commission: string, 
  credit_limit: number,
  agreement_start_date: string,
  agreement_end_date: string
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      customer_name,
      phone,
      email,
      address,
      city,
      status,
     
      payment_term,
      sales_person_id,
      account_id,
      ntn,
      reg_no,
      allow_commission,
      credit_limit,
      agreement_start_date,
      agreement_end_date,
      created_by:user_id
    });

    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
export const updateCustomer = async (
  customer_id: number,
  customer_name: string,
  phone: string,
  email: string,
  address: string,
  city: string,
  status: string,
  
  payment_term: string,
  sales_person_id: number,
  account_id: number,
  ntn: string,
  reg_no: string,
  allow_commission: string,
  credit_limit: number,
  agreement_start_date: string,
  agreement_end_date: string
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      customer_id,
      customer_name,
      phone,
      email,
      address,
      city,
      status,
      
      payment_term,
      sales_person_id,
      account_id,
      ntn,
      reg_no,
      allow_commission,
      credit_limit,
      agreement_start_date,
      agreement_end_date,
      updated_by:user_id
    });

    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
export const deleteCustomer = async (customer_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 4,
      customer_id
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
