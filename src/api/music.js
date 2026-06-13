import apiClient from "./apiClient";

/* ARCHIVE */
export const getTracks = () => apiClient.get("/admin/music/archive");

export const getTrack = (id) => apiClient.get(`/admin/music/archive/${id}`);

export const createTrack = (formData) =>
  apiClient.post("/admin/music/archive", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteTrack = (id) =>
  apiClient.delete(`/admin/music/archive/${id}`);

/* PLAYLIST */
export const getPlaylists = () => apiClient.get("/admin/music/playlist");

export const getPlaylist = (playlistId) =>
  apiClient.get(`/admin/music/playlist/${playlistId}`);

export const addTrackToPlaylist = (playlistId, dto) =>
  apiClient.post(`/admin/music/playlist/${playlistId}/tracks`, dto);

export const removeTrackFromPlaylist = (playlistId, playlistTrackId) =>
  apiClient.delete(
    `/admin/music/playlist/${playlistId}/tracks/${playlistTrackId}`,
  );
