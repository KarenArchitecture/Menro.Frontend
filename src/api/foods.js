// src/api/foods.js
import publicAxios from "./publicAxios";

export async function getPopularFoodByRandomCategory(foodsPerGroup = 8) {
    const res = await publicAxios.get("/Food/popular", {
        params: { foodsPerGroup },
    });

    return res.data || null;
    }

    export async function getPopularFoodByRandomCategoryExcluding(excludeTitles = [], foodsPerGroup = 8) {
    const body = Array.isArray(excludeTitles) ? excludeTitles : [];

    const res = await publicAxios.post(
        "/Food/popular-foods-excluding",
        body,
        { params: { foodsPerGroup } }
    );

    return res.data || null;
    }

    export async function getPopularFoodsByCategory(categoryId, count = 8) {
    const res = await publicAxios.get(`/Food/popular/${encodeURIComponent(categoryId)}`, {
        params: { count },
    });
    return res.data ?? [];
}

export const browsePopularFoodsByCategory = ({ categoryId, take = 6, cursor = null } = {}) =>
    publicAxios
        .get(`/Food/popular/${categoryId}/browse`, {
        params: { take, cursor: cursor || undefined },
        })
        .then((r) => r.data);