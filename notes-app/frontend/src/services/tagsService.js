import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URL}/api`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const tagsService = {
  getTags: async () => {
    try {
      const res = await API.get("/tags");
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to fetch tags");
    }
  },

  createTag: async (tagData) => {
    try {
      const res = await API.post("/tags", tagData);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to create tag");
    }
  },

  deleteTag: async (id) => {
    try {
      const res = await API.delete(`/tags/${id}`);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to delete tag");
    }
  },
};
