// // src/api/orders.js
// import userAxios from "./userAxios";

// // 👤 User-specific: recent orders → foods (needs logged-in user)
// export const getUserRecentOrders = (count = 8) =>
//     userAxios
//         .get(`/orders/recent-foods?count=${count}`)
//         .then((r) => r.data);

// // 🛒 Create a new order (guest OR logged-in)
// export const createOrder = (orderPayload) =>
//     userAxios
//         .post("/orders/create", orderPayload)
//         .then((r) => r.data);

// src/api/orders.js
// 👤 User-specific: recent orders → foods (needs logged-in user)
import userAxios from "./userAxios";
import publicAxios from "./publicAxios";

// Logged-in only: /api/user/orders/recent-foods
export const getUserRecentOrders = (count = 8) =>
    userAxios
        .get("/orders/recent-foods", { params: { count } })
        .then((r) => r.data);

// 🛒 Create a new order (guest OR logged-in)
export const createOrder = async (orderPayload) => {
    try {
        const response = await publicAxios.post("/orders/create", orderPayload);
        return response.data; // { orderId: ... }
    } catch (err) {
        console.error("Failed to create order:", err);
        if (err.response) {
        console.error("Backend error payload:", err.response.data);
        }
        throw err;
    }
};
