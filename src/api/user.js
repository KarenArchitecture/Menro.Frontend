import userAxios from "./userAxios";

export const getUserProfile = () => userAxios.get("/profile");

export const updateUserProfile = (formData) =>
  userAxios.put("/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
