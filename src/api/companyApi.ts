// src/api/companyApi.ts
import axios from "axios";

const API_URL = "http://localhost:5000/api/company";

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

// Get all companies
export const getCompanies = async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1 });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Add new company
export const addCompany = async (
  company_name: string,
   registration_number: string,
   address: string,
   phone: string,
   email: string,
  image :string
  
) => {
  try {
    const res = await axios.post(API_URL,  {
      operation: 2,
      company_name,
      registration_number,
      phone,
      email,
      address,
      image
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateCompany = async ( 
  company_id:number,
  company_name: string,
   registration_number: string,
   address: string,
   phone: string,
   email: string,
  image :string
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      company_id ,
      company_name,
      registration_number,
      phone,
      email,
      address,
      image
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Delete company
export const deleteCompany = async (company_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 4,
      company_id,
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
