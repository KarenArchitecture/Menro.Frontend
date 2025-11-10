import axios from "axios";

const adminDashboardAxios = axios.create({
  baseURL: "https://localhost:7270/api/adminpanel/dashboard",
  withCredentials: true,
});

adminDashboardAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default adminDashboardAxios;
