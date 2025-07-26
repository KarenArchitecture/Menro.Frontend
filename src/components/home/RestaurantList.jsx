// src/components/home/RestaurantList.jsx

import React from "react";
import SectionHeader from "../common/SectionHeader";
import RestaurantCard from "./RestaurantCard";
import FoodIcon from "../icons/FoodIcon";
import { useQuery } from "@tanstack/react-query";
import { getRandomRestaurants } from "../../api/restaurants";
import LoadingSpinner from "../common/LoadingSpinner";

function RestaurantList() {
  const {
    data: restaurants,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["randomRestaurants"],
    queryFn: getRandomRestaurants,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <p>Error loading restaurants: {error.message}</p>;

  if (!restaurants || restaurants.length === 0) {
    return <p>No restaurants found.</p>;
  }

  const baseUrl = "http://localhost:5096";

  return (
    <section className="restarants">
      <SectionHeader icon={<FoodIcon />} title="رستوران‌ها" />
      <div className="cards-container">
        {restaurants.map((restaurant) => {
          const imageUrl = restaurant.bannerImageUrl.startsWith("http")
            ? restaurant.bannerImageUrl
            : baseUrl + restaurant.bannerImageUrl;

          return (
            <RestaurantCard
              key={restaurant.id}
              restaurant={{
                name: restaurant.name,
                type: restaurant.category,
                hours: `${restaurant.openTime} تا ${restaurant.closeTime}`,
                discount: restaurant.discount || 0,
                rating: restaurant.rating.toFixed(1),
                ratingCount: restaurant.voters,
                imageUrl: imageUrl,
                logoUrl: "/images/Mask group.png",
              }}
            />
          );
        })}
      </div>
    </section>
  );
}

export default RestaurantList;
