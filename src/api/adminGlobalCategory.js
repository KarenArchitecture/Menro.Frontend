// src/api/adminGlobalFoodCategory.js
import axios from "axios";

const adminGlobalCategory = axios.create({
  baseURL: "https://localhost:7270/api/adminpanel/globalFoodCategory",
  withCredentials: true,
});

export default adminGlobalCategory;
