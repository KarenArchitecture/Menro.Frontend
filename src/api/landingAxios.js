import axios from "axios";

const landingAxios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/landing`,
});

export default landingAxios;
