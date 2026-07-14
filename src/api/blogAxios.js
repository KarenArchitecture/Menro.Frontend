import axios from "axios";

const blogAxios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/blog`,
});

export default blogAxios;
