import axios from "axios";
import ownerRestaurantTables from "./ownerRestaurantTables";

const ownerRestaurantQr = axios.create({
  ...ownerRestaurantTables.defaults,
  baseURL: ownerRestaurantTables.defaults.baseURL.replace(
    /\/tables\/?$/,
    "/qr-info",
  ),
});

// interceptorها (توکن، refresh و ...) هم از instance میزها منتقل می‌شوند
ownerRestaurantQr.interceptors.request.handlers =
  ownerRestaurantTables.interceptors.request.handlers;
ownerRestaurantQr.interceptors.response.handlers =
  ownerRestaurantTables.interceptors.response.handlers;

export default ownerRestaurantQr;
