import axios from "axios";

const API_URL = "http://84.16.235.111:2091/api/getvendors";

export const getVendors = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching vendors:", error);
    throw error;
  }
};
