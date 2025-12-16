import userAxios from "./userAxios";
import publicAxios from "./publicAxios";

// Logged-in only: /api/user/orders/recent-foods
export const getUserRecentOrders = (count = 8) =>
  userAxios
    .get("/orders/recent-foods", { params: { count } })
    .then((r) => r.data);

// 🛒 Create a new order (guest OR logged-in)
// Calls: POST /api/public/orders/create
// If accessToken exists, sends Authorization header; otherwise sends as guest.
export const createOrder = async (orderPayload) => {
  try {
    const token = localStorage.getItem("accessToken");

    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined;

    const response = await publicAxios.post(
      "/orders/create",
      orderPayload,
      config
    );
    return response.data; // { orderId: ... }
  } catch (err) {
    console.error("Failed to create order:", err);
    if (err?.response) {
      console.error("Backend error payload:", err.response.data);
      console.error("Backend status:", err.response.status);
    }
    throw err;
  }
};
