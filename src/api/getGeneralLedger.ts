import axios from "axios";

const API_URL = "http://localhost:5000/api/getGeneralLedgerRoute";

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