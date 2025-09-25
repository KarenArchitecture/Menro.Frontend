import userAxios from "./userAxios";

// 👤 User-specific: recent orders → foods
export const getUserRecentOrders = (count = 8) =>
    userAxios.get(`/orders/recent-foods?count=${count}`).then(r => r.data);
