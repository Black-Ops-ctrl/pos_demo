import axios from "axios";

const API_URL = "http://84.16.235.111:2149/api/getGeneralLedgerRoute";


const image_URL = "http://84.16.235.111:2149/api/company";




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
export const getGeneralLedger = async (
  account_id: number,
  start_date: Date,
  end_date: Date
) => {
  // Convert Date objects to YYYY-MM-DD strings before sending
  const formattedStartDate = start_date.toISOString().split('T')[0];
  const formattedEndDate = end_date.toISOString().split('T')[0];

  const res = await axios.post(API_URL, {
    account_id,
    start_date: formattedStartDate,
    end_date: formattedEndDate,
  });
  return res.data;
};



// Get company image and data
export const getCompanyimg = async () => {
  try {
    const res = await axios.post(image_URL, {
      operation: 1
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};