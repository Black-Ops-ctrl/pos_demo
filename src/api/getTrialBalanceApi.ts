import axios from "axios";

const API_URL = "http://84.16.235.111:2140/api/getTrialBalanceRoute";

// Get all companies
export const getTrialBalance = async (
  p_level_no:number,
  p_account_from:number,
  p_account_to: number,

  start_date: Date,
  end_date: Date
) => {
  // Convert Date objects to YYYY-MM-DD strings before sending
  const formattedStartDate = start_date.toISOString().split('T')[0];
  const formattedEndDate = end_date.toISOString().split('T')[0];

  const res = await axios.post(API_URL, {
    p_level_no,
    p_account_from,p_account_to,
    start_date: formattedStartDate,
    end_date: formattedEndDate,
  });
  return res.data;
};