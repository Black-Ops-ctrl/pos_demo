import axios from "axios";

const API_URL = "http://84.16.235.111:2140/api/accounting-dashboard";

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

export const getBalanceSheet = async () => {
  try {
    const res = await axios.get(API_URL);
   console.log("API Response:", res.data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
