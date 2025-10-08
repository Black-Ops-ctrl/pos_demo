import axios from "axios";

const API_URL = "http://84.16.235.111:2091/api/getwarehouses";

export const getWarehouses = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};
