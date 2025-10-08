import axios from "axios";


const API_URL = "http://84.16.235.111:2091/api/customers";
const SALES_PERSON_API_URL = "http://84.16.235.111:2091/api/getsalespersons";

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

// 🔹 Get Customers
export const getCustomers = async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1 });
   console.log("API Response:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 🔹 Add Sales Person
export const addCustomer = async (

   customer_name: string,
   phone: string,
   email: string,
   address: string,
   city: string,
   status: string,
   country: string,
   credit_limit: number,
   payment_term: string,
   sales_person_id: number,
   account_id: number,
   region_id: number,
   created_by: number,
   updated_by: number

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
      country,
      credit_limit,
      payment_term,
      sales_person_id,
      account_id,
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

// 🔹 Update Customer
export const updateCustomer = async (
  customer_id: number,
  customer_name: string,  
  phone: string,
  email: string,
  address: string,
  city: string,
  status: string,
  country: string,
  credit_limit: number,
  payment_term: string,
  sales_person_id: number,
  account_id: number,
  region_id: number,
  created_by: number,
  updated_by: number
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
      country,
      credit_limit,
      payment_term,
      sales_person_id,
      account_id,
      region_id,
      created_by,
      updated_by
    });
  } catch (error) {
    handleApiError(error);
  }
};

   // 🔹 Delete Item
export const deleteCustomer = async (customer_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 4,
      customer_id,
    });
    return res.data ; 
  } catch (error) {
    handleApiError(error);
  }
};
export const getSalesPersons = async () => {
  const res = await axios.get(SALES_PERSON_API_URL);
  return res.data; // [{ sales_person_id, sales_person_name }]
};