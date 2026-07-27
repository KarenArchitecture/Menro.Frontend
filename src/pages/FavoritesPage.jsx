import React from "react";
import FoodCard from "../components/home/FoodCard";
import StateMessage from "../components/common/StateMessage";
import "../assets/css/styles-favorites.css";
import FavoritesHeader from "../components/favorites/FavoritesHeader";
import { FoodCardsSkeleton } from "../components/home/HomeSkeletons";
import { useFavoriteFoods } from "../hooks/useFavorites";
export default function FavoritesPage() {

  const {
    data,
    isLoading,
    error,
  } = useFavoriteFoods();

  const favorites = data ?? [];

  console.log(
    "Favorite First Item:",
    JSON.stringify(data?.[0], null, 2)
  );
  console.log("Favorites Error:", error);

  if (isLoading) {
    return (
      <div className="favorites-page">
        <FavoritesHeader />

        <FoodCardsSkeleton
          title=""
          showHeader={false}
          count={6}
        />
      </div>
    );
  }

  if (error) {
    return (
      <StateMessage
        kind="error"
        title="خطا در دریافت علاقه‌مندی‌ها"
      >
        لطفاً دوباره تلاش کنید.
      </StateMessage>
    );
  }

  if (!favorites.length) {
    return (
      <StateMessage kind="empty" title="علاقه‌مندی خالیه">
        هنوز چیزی به علاقه‌مندی‌ها اضافه نکردی.
      </StateMessage>
    );
  }

  
  return (
    
    <div className="favorites-page">
      <FavoritesHeader />

      <div className="favorites-grid">
        {favorites.map((item) => (
          <div key={item.id} className="favorites-item">
            <FoodCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
