import axios from "axios";

const commentAxios = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/user/comment`,
    withCredentials: true,
});

commentAxios.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default commentAxios;