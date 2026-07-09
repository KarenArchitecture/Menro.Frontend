import restaurantCategoryAxios from "./adminRestaurantCategoryAxios";

export const getRestaurantCategories = async () => {
  const { data } = await restaurantCategoryAxios.get("/");
  return data;
};
