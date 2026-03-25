import axios from "axios";

const API_URL = "http://84.16.235.111:2149/api/updateItemRate";

const getModuleId = (): string => {
  return sessionStorage.getItem('selectedBranchId') || 'N/A';
};

const module_id = getModuleId(); 

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
export const getAllItems = async () => {
  try {
    const res = await axios.post(API_URL, { operation: 1, module_id: module_id });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateItemRates = async (
  rate_ids: number[],
  item_ids: number[],
  categories: number[],
  rates: number[],
  discounts: number[]
) => {
  try {
    // Validate array lengths
    if (rate_ids.length !== item_ids.length || 
        rate_ids.length !== categories.length || 
        rate_ids.length !== rates.length ||
        rate_ids.length !== discounts.length) {
      throw new Error("All input arrays must have the same length");
    }

    // Prepare the payload for the request to match PostgreSQL function parameters
    const payload = {
      operation: 2,
      rate_ids,
      item_ids,
      categories,
      rates,
      discounts,
      module_id: module_id
    };

    // Send the request to the API
    const res = await axios.post(API_URL, payload);

    return res.data; // Return the response from the API
  } catch (error) {
    handleApiError(error);
  }
};