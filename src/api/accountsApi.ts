import axios from "axios";

const API_URL = "http://84.16.235.111:2135/api/accounts";

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

export const getAccounts = async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1 });
   console.log("API Response:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
//  Add Warehouse
export const addAccount = async (

  account_name: string,
  account_type: string,
  parent_account_id: number
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      account_name,
      account_type,
      parent_account_id
    });
    
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Update Warehouse
export const updateAccount = async (
  account_id: number,
  account_code: string,
  account_name: string,
  account_type: string,
  parent_account_id: number
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      account_id,
      account_code,
      account_name,
      account_type,
      parent_account_id
    });
    return res.data ;
  } catch (error) {
    handleApiError(error);
  }
};

//  Delete Account
export const deleteAccount = async (account_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 4,
      account_id,
    });
    return res.data ; 
  } catch (error) {
    handleApiError(error);
  }
};
