// src/api/restaurantAxios.js
import axios from "axios";

const restaurantAxios = axios.create({
  //baseURL: "https://localhost:5096/api/public/restaurant",
  baseURL: "https://localhost:7270/api/public/restaurant",
  withCredentials: true,
});

export default restaurantAxios;
