import cartAxios from "./cartAxios";

export const fetchCart = () => cartAxios.get("/cart").then((r) => r.data);

export const setCartItem = (dto) =>
  cartAxios
    .put("/cart/items", {
      foodId: dto.foodId,
      variantId: dto.variantId ?? null,
      quantity: dto.quantity,
      addons: dto.addons ?? [],
      confirmRestaurantSwitch: !!dto.confirmRestaurantSwitch,
    })
    .then((r) => ({ conflict: false, cart: r.data }))
    .catch((err) => {
      if (err?.response?.status === 409) {
        return { conflict: true, ...err.response.data };
      }
      throw err;
    });

export const clearCart = () => cartAxios.delete("/cart");

export const checkoutCart = (tableLabel) =>
  cartAxios
    .post("/orders/checkout", { tableLabel: tableLabel ?? null })
    .then((r) => r.data);

export const getOrderBill = (orderId) =>
  cartAxios.get(`/orders/${orderId}/bill`).then((r) => r.data);

export const mergeGuestCart = () =>
  cartAxios.post("/cart/merge").then((r) => r.data);

export const fetchRestaurantTables = (restaurantId) =>
  cartAxios.get(`/restaurants/${restaurantId}/tables`).then((r) => r.data);
