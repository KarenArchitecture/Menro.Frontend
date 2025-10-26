import axios from "axios";

const iconAxios = axios.create({
  baseURL: "https://localhost:7270/api/icon",
  withCredentials: true,
});

iconAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllIcons = async () => {
  const res = await iconAxios.get("/read-all");
  return res.data;
};

export const addIcon = async (data) => {
  const res = await iconAxios.post("/add", data);
  return res.data;
};

export const deleteIcon = async (id) => {
  const res = await iconAxios.delete(`/delete?id=${id}`);
  return res.data;
};
