// src/api/adminCombosAxios.js
import axios from "axios";

const adminCombosAxios = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/owner/food/combos`,
    withCredentials: true,
});

adminCombosAxios.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default adminCombosAxios;