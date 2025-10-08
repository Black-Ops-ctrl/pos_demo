// src/api/authApi.ts
import axios from "axios";

const API_URL = "http://84.16.235.111:2091/api/login"; // adjust if needed



export const loginUser = async (username: string, password: string) => {
  try {
    const res = await axios.post(`${API_URL}`, {
      username,
      password,
    });

    // Return backend response (user object + message)
    return {
      success: true,
      ...res.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || "Login failed",
    };
  }
};
