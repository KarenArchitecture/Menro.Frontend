import axios from "axios";

const adminFoodAxios = axios.create({
  baseURL: "https://localhost:7270/api/adminpanel/food",
  withCredentials: true,
});

adminFoodAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default adminFoodAxios;
