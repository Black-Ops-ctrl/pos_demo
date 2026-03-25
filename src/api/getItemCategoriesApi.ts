import axios from "axios";

const API_URL = "http://84.16.235.111:2149/api/getItemCategories";

export const getItemCategories = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};
