// src/api/orders.js
import userAxios from "./userAxios";

// 👤 User-specific: recent orders → foods (needs logged-in user)
export const getUserRecentOrders = (count = 8) =>
    userAxios
        .get(`/orders/recent-foods?count=${count}`)
        .then((r) => r.data);

// 🛒 Create a new order (guest OR logged-in)
export const createOrder = (orderPayload) =>
    userAxios
        .post("/orders/create", orderPayload)
        .then((r) => r.data);
