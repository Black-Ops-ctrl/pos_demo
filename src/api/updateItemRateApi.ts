import axios from "axios";

const API_URL = "http://84.16.235.111:2091/api/updateItemRate";

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
    const res = await axios.post(API_URL, { operation: 1 ,module_id:1});
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
export const updateItemRates = async (
  rate_ids: number[],
  item_ids: number[],
  categories: number[],
  warehouse_ids: number[],
  rates: number[] // Renamed from prices to rates for clarity
) => {
  try {
    // ... (array length check remains valid)

    // Prepare the payload for the request to match PostgreSQL function parameters
    const payload = {
      operation: 2,
      rate_ids,
      item_ids,
     categories,
     warehouse_ids,
      rates, // Match the function parameter name p_rates
      module_id: 1, // Assuming this is the fixed module ID
    };

    // Send the request to the API
    const res = await axios.post(API_URL, payload); // Send the flat array payload

    return res.data; // Return the response from the API
  } catch (error) {
    handleApiError(error);
  }
};