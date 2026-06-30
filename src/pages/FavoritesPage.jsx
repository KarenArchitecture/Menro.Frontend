import React from "react";
import FoodCard from "../components/home/FoodCard";
import StateMessage from "../components/common/StateMessage";
import "../assets/css/styles-favorites.css";
import FavoritesHeader from "../components/favorites/FavoritesHeader";
import { useFavoriteFoods } from "../hooks/useFavorites";
export default function FavoritesPage() {
  // TEMP MOCK (later → API)
  const favorites = [
    {
      id: 1,
      name: "قهوه مدل دوم",
      price: 870000,
      imageUrl: "/images/foods/coffee1.jpg",
      restaurantName: "کافه منرو",
      rating: 4.5,
    },
    {
      id: 2,
      name: "قهوه با نام طولانی ...",
      price: 870000,
      imageUrl: "/images/foods/coffee2.jpg",
      restaurantName: "کافه منرو",
      rating: 4.2,
    },
  ];

  const {
    data,
    isLoading,
    error,
  } = useFavoriteFoods();

  console.log(
    "Favorite First Item:",
    JSON.stringify(data?.[0], null, 2)
  );
  console.log("Favorites Error:", error);

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
