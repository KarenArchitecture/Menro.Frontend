// src/utils/groupFoodsByCategory.js
const FA_COLLATOR = new Intl.Collator("fa");

export function groupFoodsByCategory(foods) {
    const groups = new Map();

    for (const food of foods) {
        const categoryName = food.foodCategoryName?.trim() || "بدون دسته‌بندی";
        if (!groups.has(categoryName)) groups.set(categoryName, []);
        groups.get(categoryName).push(food);
    }

    const result = Array.from(groups.entries()).map(([categoryName, items]) => ({
        categoryName,
        foods: items.sort((a, b) => FA_COLLATOR.compare(a.name || "", b.name || "")),
    }));

    // "بدون دسته‌بندی" always sinks to the bottom regardless of alphabet
    return result.sort((a, b) => {
        if (a.categoryName === "بدون دسته‌بندی") return 1;
        if (b.categoryName === "بدون دسته‌بندی") return -1;
        return FA_COLLATOR.compare(a.categoryName, b.categoryName);
    });
}