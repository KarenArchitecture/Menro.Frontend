// src/api/userAxios.js
import axios from "axios";

const userAxios = axios.create({
  baseURL: "https://localhost:7270/api/user",
  withCredentials: true, // ok to keep; JWT is in header anyway
});

userAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default userAxios;

