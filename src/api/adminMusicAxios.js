import axios from "axios";

// ----------------------
// Axios instance for Admin Music
// ----------------------
const adminMusicAxios = axios.create({
  baseURL: "https://localhost:7270/api/admin/music",
  withCredentials: true, // اگر cookie-based auth داری
});

// ----------------------
// Attach Bearer token automatically
// ----------------------
adminMusicAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----------------------
// CRUD Methods
// ----------------------
const musicApi = {
  // GET list
  getList: (searchTerm = "") =>
    adminMusicAxios.get("", { params: { search: searchTerm } }),

  // GET details
  getById: (id) => adminMusicAxios.get(`/${id}`),

  // POST / Create music
  create: async (data) => {
    // data = { title, artist, musicFile, coverFile }
    const formData = new FormData();
    formData.append("Title", data.title);
    formData.append("Artist", data.artist);
    formData.append("MusicFile", data.musicFile);
    if (data.coverFile) formData.append("CoverFile", data.coverFile);

    return adminMusicAxios.post("", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // PUT / Update
  update: (data) =>
    adminMusicAxios.put("", {
      id: data.id,
      title: data.title,
      artist: data.artist,
      isActive: data.isActive,
    }),

  // DELETE
  delete: (id) => adminMusicAxios.delete(`/${id}`),
};

export default musicApi;
