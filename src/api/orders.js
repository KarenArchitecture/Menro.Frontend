import userAxios from "./userAxios";
import publicAxios from "./publicAxios";

const getAuthToken = () =>
  localStorage.getItem("token") || localStorage.getItem("accessToken");

/* -------------------------------------------------------------------------- */
/*                                    Orders                                  */
/* -------------------------------------------------------------------------- */

// Home: recent ordered foods
// GET /api/user/orders/recent-foods?count=8
export const getUserRecentOrders = (count = 8) =>
  userAxios
    .get("/orders/recent-foods", {
      params: { count },
    })
    .then((r) => r.data);

// View All: cursor-based lazy loading
// GET /api/user/orders/recent-foods/browse?take=6&cursor=...
export const browseUserRecentOrders = (
  { take = 6, cursor = null } = {}
) =>
  userAxios
    .get("/orders/recent-foods/browse", {
      params: {
        take,
        cursor: cursor || undefined,
      },
    })
    .then((r) => r.data);

// Continue Shopping
// GET /api/user/orders/current
export const getCurrentOrder = () =>
  userAxios
    .get("/orders/current")
    .then((r) => r.data);

// Orders List
// GET /api/user/orders
export const getUserOrders = () =>
  userAxios
    .get("/orders")
    .then((r) => r.data);

// Order Details / Invoice
// GET /api/user/orders/{orderId}
export const getUserOrderDetails = (orderId) =>
  userAxios
    .get(`/orders/${orderId}`)
    .then((r) => r.data);

// Create Order (Guest or Logged-in)
// POST /api/public/orders/create
export const createOrder = async (orderPayload) => {
  try {
    const token = getAuthToken();

    const config = token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined;

    const response = await publicAxios.post(
      "/orders/create",
      orderPayload,
      config
    );

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