// src/api/restaurantPaymentAxios.js
import axios from "axios";

const restaurantPaymentAxios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/admin/restaurant/payment`,
  withCredentials: true,
});

restaurantPaymentAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getRestaurantPaymentMethod = () =>
  restaurantPaymentAxios.get("").then((r) => r.data.paymentMethod);

export const setRestaurantPaymentMethod = (paymentMethod) =>
  restaurantPaymentAxios.put("", { paymentMethod }).then((r) => r.data);

export default restaurantPaymentAxios;