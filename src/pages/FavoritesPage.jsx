import React from "react";
import FoodCard from "../components/home/FoodCard";
import StateMessage from "../components/common/StateMessage";
import "../assets/css/styles-favorites.css";
import FavoritesHeader from "../components/favorites/FavoritesHeader";
export default function FavoritesPage() {
  // TEMP MOCK (later → API)
  const favorites = [
    { id: 1, name: "قهوه مدل دوم", price: 870000 },
    { id: 2, name: "قهوه با نام طولانی ...", price: 870000 },
    { id: 3, name: "موهیتو", price: 120000 },
    { id: 4, name: "لاته", price: 95000 },
  ];

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
