import axios from "axios";

const iconAxios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/icon`,
  withCredentials: true,
});

iconAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default iconAxios;
