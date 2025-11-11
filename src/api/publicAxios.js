// src/api/publicAxios.js
import axios from "axios";

const publicAxios = axios.create({
  //baseURL: "http://localhost:5096/api/public",
  baseURL: "https://localhost:7270/api/public",
  withCredentials: false, // or true if needed
});

export default publicAxios;


// src/api/publicAxios.js
// import axios from "axios";

// const publicAxios = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:7270/api/public",
//   withCredentials: false,
// });

// export default publicAxios;