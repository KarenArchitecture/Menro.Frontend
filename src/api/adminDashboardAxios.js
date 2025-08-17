// src/api/adminAxios.js
import axios from "axios";

const adminAxios = axios.create({
  baseURL: "https://localhost:7270/api/adminpanel/dashboard",
  withCredentials: true,
});

export default adminAxios;
