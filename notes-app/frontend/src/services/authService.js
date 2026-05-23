import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
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

  getProfile: async () => {
    try {
      const res = await API.get("/auth/profile");
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to get profile");
    }
  },

  updateInfo: async (name) => {
    try {
      const res = await API.put("/auth/profile/info", { name });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to update info");
    }
  },

  updatePassword: async (currentPassword, newPassword) => {
    try {
      const res = await API.put("/auth/profile/password", {
        currentPassword,
        newPassword,
      });
      return res.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to update password",
      );
    }
  },
};
