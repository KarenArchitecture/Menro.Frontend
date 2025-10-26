// // src/api/authAxios.js
// import axios from "axios";

// const authAxios = axios.create({
//   //baseURL: "https://localhost:5096/api/auth",
//   baseURL: "https://localhost:7270/api/auth",
//   withCredentials: true,
// });

// export default authAxios;

// src/api/authAxios.js
import axios from "axios";

const base = import.meta.env.VITE_API_BASE_URL?.replace("/public", "") || "https://localhost:7270/api";

const authAxios = axios.create({
  baseURL: "https://localhost:7270/api/auth",
  withCredentials: true,
});

export default authAxios;