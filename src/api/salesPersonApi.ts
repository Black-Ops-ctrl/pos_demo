import axios from "axios";
import { getCurrentUserId } from "@/components/security/LoginPage";

const user_id = getCurrentUserId();


const API_URL = "http://84.16.235.111:2140/api/salespersons";
const REGION_API_URL = "http://84.16.235.111:2140/api/getregions";

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

// 🔹 Get Sales Persons (UPDATED to include module_id)
export const getSalesPersons = async () => {
  try {
    const res = await axios.post(API_URL, {
      operation: 1
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};


// 🔹 Add Sales Person (UPDATED to include module_id)
export const addSalePerson = async (
  sales_person_name: string,
  father_name: string,
  phone: string,
  
  account_id: number,
  branch_id: number,
  company_id: number
) => {
  

  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      sales_person_name,
      father_name,
      phone,
      
      account_id,
      branch_id,
      company_id,
     
      created_by:user_id
    });

    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Update Sales Person
export const updateSalePerson = async (
  sales_person_id: number,
  sales_person_name: string,
  father_name: string,
  phone: string,
 
  account_id: number,
  branch_id: number,
  company_id: number
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      sales_person_id,
      sales_person_name,
      father_name,
      phone,
      
      account_id,
      branch_id,
      company_id,
     
      
      updated_by:user_id
    });

    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Delete Item
export const deleteSalePerson = async (sales_person_id: number) => {
    try {
        const res = await axios.post(API_URL, {
            operation: 4,
            sales_person_id,
        });
        return res.data;
    } catch (error) {
        handleApiError(error);
    }
};
