import axios from "axios";

const API_URL = "http://84.16.235.111:2149/api/getAuditLogs";

// Get all branches
export const getAuditDetail = async () => {
  const res = await axios.get(API_URL);
  return res.data; 
};