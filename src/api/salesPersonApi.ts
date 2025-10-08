import axios from "axios";


const API_URL = "http://84.16.235.111:2091/api/salespersons";
const REGION_API_URL="http://84.16.235.111:2091/api/getregions";

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

// 🔹 Get Sales Persons
export const getSalesPersons = async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1 });
   console.log("API Response:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Add Sales Person
export const addSalePerson = async (

   sales_person_name: string,
   father_name: string,
   phone: string,
   designation_id: number,
   branch_id: number,
   company_id: number,
   region_id: number,
   created_by: number,
   updated_by: number

) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      sales_person_name,
      father_name,
      phone,
      designation_id,
      branch_id,
      company_id,
      region_id,
      created_by,
      updated_by
    });
    // Backend returns: { success: true, message: "SalesPerson added successfully" }
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
  designation_id: number,
  branch_id: number,
  company_id: number,
  region_id: number,
  created_by: number,
  updated_by: number
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      sales_person_id,
      sales_person_name,
      father_name,
      phone,
      designation_id,
      branch_id,
      company_id,
      region_id,
      created_by,
      updated_by
    });
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
    return res.data ; 
  } catch (error) {
    handleApiError(error);
  }
};
export const getRegions = async () => {
  const res = await axios.get(REGION_API_URL);
  return res.data; // [{ region_id, region_name }]
};