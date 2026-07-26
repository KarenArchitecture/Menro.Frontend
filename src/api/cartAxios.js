import axios from "axios";
import { getOrCreateGuestCartId } from "../utils/guestCart";

const cartAxios = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/public`,
});

cartAxios.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers["X-Guest-Cart-Id"] = getOrCreateGuestCartId();
    return config;
});

export default cartAxios;