import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const authService = {
  login: async (credentials) => {
    try {
      const res = await API.post("/auth/login", credentials);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Login failed");
    }
  },

  register: async (userData) => {
    try {
      const res = await API.post("/auth/register", userData);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Registration failed");
    }
  },
};
