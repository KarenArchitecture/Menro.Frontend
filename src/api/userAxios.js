// src/api/userAxios.js
import axios from "axios";

const userAxios = axios.create({
    // baseURL: "http://localhost:5096/api/user", 
    baseURL: "https://localhost:7270/api/user", 
    withCredentials: true, // ✅ to send cookies/token if needed
});

export default userAxios;
