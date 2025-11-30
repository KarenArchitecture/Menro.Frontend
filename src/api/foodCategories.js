// src/api/foodCategories.js
import publicAxios from "./publicAxios";

// Get all food categories (global + restaurant-specific) by restaurant slug
export const getRestaurantPageFoodCategoriesBySlug = async (slug) => {
    try {
        const { data } = await publicAxios.get(`/restaurant/${slug}/foodcategories`);
        // data is an array of { id, name, svgIcon, globalFoodCategoryId }
        return data;
    } catch (error) {
        console.error("Failed to fetch restaurant food categories:", error);
        throw error;
    }
};
