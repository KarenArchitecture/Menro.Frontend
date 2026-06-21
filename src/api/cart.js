import publicAxios from "./publicAxios";
import userAxios from "./userAxios";

const getToken = () =>
    localStorage.getItem("token") || localStorage.getItem("accessToken");

const getAuthHeaders = () => {
    const token = getToken();
    return token
        ? { Authorization: `Bearer ${token}` }
        : {};
};

/* -------------------------------------------------------------------------- */
/*                                    CART                                    */
/* -------------------------------------------------------------------------- */

// Get current cart (guest or user)
export const getCart = () =>
    publicAxios
        .get("/cart", {
        headers: getAuthHeaders(),
        })
        .then((r) => r.data);

// Add item to cart
export const addToCart = (payload) =>
    publicAxios
        .post("/cart/items", payload, {
        headers: getAuthHeaders(),
        })
        .then((r) => r.data);

// Update cart item (quantity, addons)
export const updateCartItem = (itemId, payload) =>
    publicAxios
        .put(`/cart/items/${itemId}`, payload, {
        headers: getAuthHeaders(),
        })
        .then((r) => r.data);

// Remove item
export const removeCartItem = (itemId) =>
    publicAxios
        .delete(`/cart/items/${itemId}`, {
        headers: getAuthHeaders(),
        })
        .then((r) => r.data);

// Clear entire cart
export const clearCart = () =>
    publicAxios
        .delete("/cart", {
        headers: getAuthHeaders(),
        })
        .then((r) => r.data);

// Switch restaurant (popup flow)
export const switchRestaurant = (newRestaurantId) =>
    publicAxios
        .post(
        "/cart/switch-restaurant",
        { newRestaurantId, confirmReplace: true },
        { headers: getAuthHeaders() }
        )
        .then((r) => r.data);

// Merge guest cart into user cart after login
export const mergeCart = () =>
    publicAxios
        .post(
        "/cart/merge",
        {},
        { headers: getAuthHeaders() }
        )
        .then((r) => r.data);