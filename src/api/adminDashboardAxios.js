import axios from "axios";

const adminAxios = axios.create({
  baseURL: "https://localhost:7270/api/adminpanel/dashboard",
  withCredentials: true,
});

adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default adminAxios;
