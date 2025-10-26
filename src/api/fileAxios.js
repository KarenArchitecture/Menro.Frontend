import axios from "axios";

const fileAxios = axios.create({
  baseURL: "https://localhost:7270/api/file",
  withCredentials: true,
});

fileAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default fileAxios;
