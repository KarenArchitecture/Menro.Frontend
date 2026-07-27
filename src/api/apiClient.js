import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Inject JWT automatically into every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // یا sessionStorage / redux

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
