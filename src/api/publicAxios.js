// src/api/publicAxios.js
import axios from "axios";

const publicAxios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/public`,
  withCredentials: false, // or true if needed
});

export default publicAxios;