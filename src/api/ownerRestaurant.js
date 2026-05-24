// src/api/ownerRestaurant.js
import ownerRestaurantAxios from "./ownerRestaurantAxios";

export const getRestaurantProfile = () => ownerRestaurantAxios.get("/profile");

export const updateRestaurantProfile = (formData) =>
  ownerRestaurantAxios.put("/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
