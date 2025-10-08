import axios from "axios";

const API_URL = "http://84.16.235.111:2091/api/getdesignations";

export const getDesignations = async () => {
  const res = await axios.get(`${API_URL}`);
  return res.data;
};
