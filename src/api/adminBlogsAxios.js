import axios from "axios";

const adminBlogsAxios = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/admin/blog`,
    withCredentials: true,
});

adminBlogsAxios.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default adminBlogsAxios;
