// src/api/companyApi.ts
import axios from "axios";

const API_URL = "http://84.16.235.111:2140/api/company";

/**
 * Retrieves the 'module_id' (which corresponds to 'selectedBranchId') from sessionStorage.
 * This ensures the correct branch context is sent with every API request.
 * @returns {string} The selected branch ID or 'N/A' if not found.
 */
const getModuleId = (): string => {
  // Use 'selectedBranchId' as the module_id for API operations
  return sessionStorage.getItem('selectedBranchId') || 'N/A';
};

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

// ----------------------------------------------------
// --- API Functions Updated with optional 'image' parameter ---
// ----------------------------------------------------

// Get all companies
export const getCompanies = async () => {
  const module_id = getModuleId(); 
  
  try {
    const res = await axios.post(API_URL, { 
      operation: 1    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Add new company
export const addCompany = async (
  name: string,
  registration_number: string,
  address: string,
  phone: string,
  email: string,
  image?: string, // 🔑 Made image optional
) => {
  const module_id = getModuleId(); 

  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      module_id, 
      name,
      registration_number,
      phone,
      email,
      address,
      image: image || null, // Send null if undefined
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Update company
export const updateCompany = async ( 
  id:number,
  name: string,
  registration_number: string,
  address: string,
  phone: string,
  email: string,
  image?: string // 🔑 Made image optional
) => {
  const module_id = getModuleId(); 

  try {
    const res = await axios.post(API_URL, {
      operation: 3,
    
      id,
      name,
      registration_number,
      phone,
      email,
      address,
      image: image || null // Send null if undefined, the API will handle if it's a new base64 or a null for no change/removal
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Delete company
export const deleteCompany = async (id: number) => {
  const module_id = getModuleId(); 

  try {
    const res = await axios.post(API_URL, {
      operation: 4,
     
      id,
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};