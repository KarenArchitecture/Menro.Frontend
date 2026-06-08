import apiClient from "./apiClient";

// GET
export const getTracks = () => apiClient.get("/music-tracks");

// CREATE (multipart/form-data)
export const createTrack = (formData) =>
  apiClient.post("/music-tracks", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// DELETE
export const deleteTrack = (id) => apiClient.delete(`/music-tracks/${id}`);
