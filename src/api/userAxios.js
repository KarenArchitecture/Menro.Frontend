// // src/api/userAxios.js
// import axios from "axios";

// const userAxios = axios.create({
//   baseURL: "https://localhost:7270/api/user",
//   withCredentials: true, // ok to keep; JWT is in header anyway
// });

// userAxios.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default userAxios;




// src/api/userAxios.js
import axios from "axios";

const base = import.meta.env.VITE_API_BASE_URL?.replace("/public", "") || "https://localhost:7270/api";

const userAxios = axios.create({
  baseURL: `${base}/user`,
  withCredentials: true,
});

userAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default userAxios;
