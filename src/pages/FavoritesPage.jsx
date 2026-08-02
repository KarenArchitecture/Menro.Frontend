import React from "react";
import FoodCard from "../components/home/FoodCard";
import StateMessage from "../components/common/StateMessage";
import "../assets/css/styles-favorites.css";
import FavoritesHeader from "../components/favorites/FavoritesHeader";
import { FoodCardsSkeleton } from "../components/home/HomeSkeletons";
import { useFavoriteFoods } from "../hooks/useFavorites";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function FavoritesPage() {
  useDocumentTitle("علاقه‌مندی‌ها");
  const { data, isLoading, error } = useFavoriteFoods();

  const favorites = data ?? [];

  return (
    <div className="favorites-page">
      <FavoritesHeader />

      {isLoading && <FoodCardsSkeleton title="" showHeader={false} count={6} />}

      {!isLoading && error && (
        <StateMessage kind="error" title="خطا در دریافت علاقه‌مندی‌ها">
          لطفاً دوباره تلاش کنید.
        </StateMessage>
      )}

      {!isLoading && !error && favorites.length === 0 && (
        <StateMessage kind="empty" title="علاقه‌مندی خالیه">
          هنوز چیزی به علاقه‌مندی‌ها اضافه نکردی.
        </StateMessage>
      )}

      {!isLoading && !error && favorites.length > 0 && (
        <div className="favorites-grid">
          {favorites.map((item) => (
            <div key={item.id} className="favorites-item">
              <FoodCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}