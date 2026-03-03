import axios from "axios";

const API_URL = "http://84.16.235.111:2140/api/getBirdsVehicleLedger";

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

// Fetch vehicle ledger - REMOVED vehicle_no parameter
export const getBirdsVehicleLedger = async (start_date: string, end_date: string) => {
  try {
    const res = await axios.post(API_URL, {
      start_date,
      end_date
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return res.data; 
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};