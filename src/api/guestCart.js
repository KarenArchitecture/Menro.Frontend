const GUEST_CART_KEY = "menro_guest_cart_id";

export function getOrCreateGuestCartId() {
    let id = localStorage.getItem(GUEST_CART_KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(GUEST_CART_KEY, id);
    }
    return id;
}