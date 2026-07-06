import axios from "axios";

const userAxios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/user`,
});

userAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default userAxios;
