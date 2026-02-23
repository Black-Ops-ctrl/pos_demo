import axios from "axios";

const API_URL = "http://84.16.235.111:2135/api/item-profit-loss";  // your backend endpoint



// Handle errors
const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error("API error:", error.response.data);
      throw new Error(error.response.data?.message || `API Error: ${error.response.status}`);
    } else if (error.request) {
      throw new Error("No response from server");
    }
  }
  throw new Error("Unexpected error");
};



// Fetch profit/loss report
export const getItemProfitLoss = async (item_id: number, start_date: string, end_date: string) => {
  try {
    const res = await axios.post(API_URL, {
      operation: 1,
      item_id,
      start_date,
      end_date
    });

    return res.data; 
  } catch (error) {
    handleApiError(error);
  }
};
