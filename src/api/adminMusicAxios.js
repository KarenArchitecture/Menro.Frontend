import { createAuthenticatedAxios } from "./createAuthenticatedAxios";

const adminMusicAxios = createAuthenticatedAxios({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/music`,
  requireAuth: true,
});

const musicApi = {
  getList: (searchTerm = "") =>
    adminMusicAxios.get("", { params: { search: searchTerm } }),

  getById: (id) => adminMusicAxios.get(`/${id}`),

  create: async (data) => {
    const formData = new FormData();
    formData.append("Title", data.title);
    formData.append("Artist", data.artist);
    formData.append("MusicFile", data.musicFile);
    if (data.coverFile) formData.append("CoverFile", data.coverFile);

    return adminMusicAxios.post("", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (data) =>
    adminMusicAxios.put("", {
      id: data.id,
      title: data.title,
      artist: data.artist,
      isActive: data.isActive,
    }),

  delete: (id) => adminMusicAxios.delete(`/${id}`),
};

export default musicApi;
