// src/api/companyApi.ts
import axios from "axios";

const API_URL = "http://84.16.235.111:2149/api/company";

/**
 * Retrieves the 'module_id' (which corresponds to 'selectedBranchId') from sessionStorage.
 * @returns {number | null} The selected branch ID as number or null if not found.
 */
const getModuleId = (): number | null => {
  const branchId = sessionStorage.getItem('selectedBranchId');
  if (branchId && branchId !== 'N/A') {
    return parseInt(branchId, 10);
  }
  return null;
};

const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error("API error response:", error.response.data);
      console.error("API error status:", error.response.status);
      console.error("API error headers:", error.response.headers);
      
      // Log the full error details
      const errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          JSON.stringify(error.response.data) ||
                          `API Error: ${error.response.status}`;
      
      throw new Error(errorMessage);
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
    const res = await axios.post(API_URL, { 
      operation: 1,
      module_id: getModuleId()
    });
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
  image?: string,
) => {
  const module_id = getModuleId();
  
  // Validate required fields
  if (!name || name.trim() === '') {
    throw new Error("Company name is required");
  }

  // Prepare payload
  const payload: any = {
    operation: 2,
    name: name.trim(),
    registration_number: registration_number || null,
    address: address || null,
    phone: phone || null,
    email: email || null,
    image: image || null,
  };

  // Only add module_id if it exists
  if (module_id) {
    payload.module_id = module_id;
  }

  console.log("Sending add company payload:", payload);

  try {
    const res = await axios.post(API_URL, payload);
    console.log("Add company response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Add company error details:", error);
    handleApiError(error);
  }
};

// Update company
export const updateCompany = async ( 
  id: number,
  name: string,
  registration_number: string,
  address: string,
  phone: string,
  email: string,
  image?: string
) => {
  const module_id = getModuleId();

  // Validate required fields
  if (!id) {
    throw new Error("Company ID is required for update");
  }
  
  if (!name || name.trim() === '') {
    throw new Error("Company name is required");
  }

  // Prepare payload
  const payload: any = {
    operation: 3,
    id: id,
    name: name.trim(),
    registration_number: registration_number || null,
    address: address || null,
    phone: phone || null,
    email: email || null,
    image: image || null,
  };

  // Only add module_id if it exists
  if (module_id) {
    payload.module_id = module_id;
  }

  console.log("Sending update company payload:", payload);

  try {
    const res = await axios.post(API_URL, payload);
    console.log("Update company response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Update company error details:", error);
    handleApiError(error);
  }
};

// Delete company
export const deleteCompany = async (id: number) => {
  const module_id = getModuleId();

  if (!id) {
    throw new Error("Company ID is required for deletion");
  }

  const payload: any = {
    operation: 4,
    id: id,
  };

  if (module_id) {
    payload.module_id = module_id;
  }

  console.log("Sending delete company payload:", payload);

  try {
    const res = await axios.post(API_URL, payload);
    console.log("Delete company response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Delete company error details:", error);
    handleApiError(error);
  }
};