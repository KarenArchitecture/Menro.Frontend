import userAxios from "./userAxios";
import publicAxios from "./publicAxios";

const getAuthToken = () =>
  localStorage.getItem("token") || localStorage.getItem("accessToken");

// ✅ Home
export const getUserRecentOrders = (count = 8) =>
  userAxios.get("/orders/recent-foods", { params: { count } }).then((r) => r.data);

// ✅ View All: cursor-based lazy loading
// Backend: GET /api/user/orders/recent-foods/browse?take=6&cursor=...
export const browseUserRecentOrders = ({ take = 6, cursor = null } = {}) =>
  userAxios
    .get("/orders/recent-foods/browse", {
      params: {
        take,
        cursor: cursor || undefined,
      },
    })
    .then((r) => r.data);

// 🛒 Create a new order (guest OR logged-in)
export const createOrder = async (orderPayload) => {
  try {
    const token = getAuthToken();

    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined;

    const response = await publicAxios.post("/orders/create", orderPayload, config);
    return response.data;
  } catch (err) {
    console.error("Failed to create order:", err);
    if (err?.response) {
      console.error("Backend error payload:", err.response.data);
      console.error("Backend status:", err.response.status);
    }
    throw err;
  }
};