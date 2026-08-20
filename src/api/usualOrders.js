import userAxios from "./userAxios";

export const getUsualOrders = (restaurantId, count = 12) =>
    userAxios
        .get(`/orders/usual/${restaurantId}`, { params: { count } })
        .then((r) => r.data);