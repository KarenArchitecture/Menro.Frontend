// src/api/adminCustomFoodCategory.js
import axios from "axios";

const adminCustomCategory = axios.create({
  baseURL: "https://localhost:7270/api/adminpanel/customFoodCategory",
  withCredentials: true,
});
export default adminCustomCategory;
