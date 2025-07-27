// src/api/publicAxios.js
import axios from "axios";

const publicAxios = axios.create({
  //baseURL: "http://localhost:5096/api/public",
  baseURL: "https://localhost:7270/api/public",
  withCredentials: false, // or true if needed
});

export default publicAxios;
