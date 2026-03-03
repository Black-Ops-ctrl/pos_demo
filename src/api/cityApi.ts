// src/api/cityApi.ts  <-- (Recommended change from departmentApi.ts to reflect content)
import axios from "axios";

const API_URL = "http://84.16.235.111:2140/api/city";

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

// --- API Functions for City Management ---

// 1️⃣ Get all City (Used for listing and likely for dropdown in the Branch form)
export const getCity = async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1 });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 2️⃣ Add City
export const addCity = async (
  city_name: string
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 2,
      city_name
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 3️⃣ Update City
export const updateCity = async (
  city_id: number,
  city_name: string
) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 3,
      city_id,
      city_name
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

// 4️⃣ Delete City
export const deleteCity = async (city_id: number) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 4,
      city_id
    });
    return res.data; 
  } catch (error) {
    handleApiError(error);
  }
};

// 5️⃣ Get all cities for dropdown (Alternative/Specific operation for dropdown data)
export const getAllCitiesForDropdown = async () => {
  try {
    const res = await axios.post(API_URL, { operation: 5 });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};