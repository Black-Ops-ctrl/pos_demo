import axios from "axios";

const API_URL = "http://84.16.235.111:2135/api/getCompanies";

// Get all companies
export const getCompanies = async () => {
  const res = await axios.get(`${API_URL}`);
  return res.data; // [{ company_id, company_name }]
};