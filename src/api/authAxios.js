// src/api/authAxios.js
import axios from "axios";

const authAxios = axios.create({
  baseURL: "https://localhost:7270/api/auth",
  withCredentials: true,
});

export default authAxios;
