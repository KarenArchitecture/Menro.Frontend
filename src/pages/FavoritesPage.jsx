import React from "react";
import FoodCard from "../components/home/FoodCard";
import StateMessage from "../components/common/StateMessage";
import "../assets/css/styles-favorites.css";
import FavoritesHeader from "../components/favorites/FavoritesHeader";
export default function FavoritesPage() {
  // TEMP MOCK (later → API)
  const favorites = Array.from({ length: 30 }).map((_, i) => ({
    id: i + 1,
    name: `آیتم شماره ${i + 1}`,
    price: 50000 + i * 15000,
    imageUrl: `/images/foods/coffee${(i % 5) + 1}.jpg`,
    restaurantName: "کافه منرو",
    rating: (4 + (i % 5) * 0.1).toFixed(1),
    voters: 120 + i * 3,
  }));

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
