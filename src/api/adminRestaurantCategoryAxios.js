import axios from "axios";

const adminRestaurantCategoryAxios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/restaurant-categories`,
  withCredentials: true,
});

adminRestaurantCategoryAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default adminRestaurantCategoryAxios;
