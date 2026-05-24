import axios from "axios";

const fileAxios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/file`,
  withCredentials: true,
});

fileAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default fileAxios;
