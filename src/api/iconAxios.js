import axios from "axios";

const iconAxios = axios.create({
  baseURL: "https://localhost:7270/api/icon",
  withCredentials: true,
});

iconAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default iconAxios;
