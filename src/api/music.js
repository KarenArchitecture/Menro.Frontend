import apiClient from "./apiClient";

/* ARCHIVE */
export const getTracks = () => apiClient.get("/admin/music/archive");

export const getTrack = (id) => apiClient.get(`/admin/music/archive/${id}`);

export const createTrack = (formData) =>
  apiClient.post("/admin/music/archive", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const renameTrack = (id, dto) =>
  apiClient.put(`/admin/music/archive/${id}`, dto);

export const deleteTrack = (id) =>
  apiClient.delete(`/admin/music/archive/${id}`);

/* PLAYLIST */

export const createPlaylist = (dto) =>
  apiClient.post("/admin/music/playlist", dto);

export const getPlaylists = () => apiClient.get("/admin/music/playlist");

export const getPlaylist = (playlistId) =>
  apiClient.get(`/admin/music/playlist/${playlistId}`);

export const renamePlaylist = (playlistId, dto) =>
  apiClient.put(`/admin/music/playlist/${playlistId}/rename`, dto);

export const deletePlaylist = (playlistId) =>
  apiClient.delete(`/admin/music/playlist/${playlistId}`);

export const activatePlaylist = (playlistId) =>
  apiClient.put(`/admin/music/playlist/${playlistId}/activate`);

/* PLAYLIST TRACKS */

export const addTrackToPlaylist = (playlistId, dto) =>
  apiClient.post(`/admin/music/playlist/${playlistId}/tracks`, dto);

export const removeTrackFromPlaylist = (playlistId, playlistTrackId) =>
  apiClient.delete(
    `/admin/music/playlist/${playlistId}/tracks/${playlistTrackId}`,
  );

export const reorderPlaylistTrack = (playlistId, playlistTrackId, direction) =>
  apiClient.put(
    `/admin/music/playlist/${playlistId}/tracks/${playlistTrackId}/move`,
    {
      direction,
    },
  );
