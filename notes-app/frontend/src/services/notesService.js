import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const notesService = {
  getNotes: async () => {
    try {
      const res = await API.get("/notes");
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to fetch notes");
    }
  },

  getTrashNotes: async () => {
    try {
      const res = await API.get("/notes/trash");
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to fetch trash");
    }
  },

  createNote: async (noteData) => {
    try {
      const res = await API.post("/notes", noteData);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to create note");
    }
  },

  updateNote: async (id, noteData) => {
    try {
      const res = await API.put(`/notes/${id}`, noteData);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to update note");
    }
  },

  deleteNote: async (id) => {
    try {
      const res = await API.delete(`/notes/${id}`);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to delete note");
    }
  },

  emptyTrash: async () => {
    try {
      const res = await API.delete("/notes/trash/empty");
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to empty trash");
    }
  },

  importNotes: async (notes) => {
    try {
      const res = await API.post("/notes/import", { notes });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to import notes");
    }
  },
};
