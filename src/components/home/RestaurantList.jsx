// src/components/home/RestaurantList.jsx
import React from "react";
import SectionHeader from "../common/SectionHeader";
import RestaurantCard from "./RestaurantCard";
import { useQuery } from "@tanstack/react-query";
import { getRandomRestaurants } from "../../api/restaurants";
import LoadingSpinner from "../common/LoadingSpinner";
import StarIcon2 from "../icons/StarIcon2";

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
  if (!restaurants || restaurants.length === 0)
    return <p>No restaurants found.</p>;

  const base = import.meta.env.BASE_URL;

  const cardImages = [
    `${base}images/res-card-1.png`,
    `${base}images/res-card-2.png`,
    `${base}images/res-card-3.png`,
  ];

  const logos = [
    `${base}images/logo-green.png`,
    `${base}images/logo-orange.png`,
  ];

  return (
    <section className="restaurants">
      <SectionHeader icon={<StarIcon2 />} title="رستوران‌ و کافه‌ها" />
      <div className="cards-container">
        {restaurants.map((r, idx) => (
          <RestaurantCard
            key={r.id}
            restaurant={{
              name: r.name,
              type: r.category,
              hours: `${r.openTime ?? "نامشخص"} تا ${r.closeTime ?? "نامشخص"}`,
              discount: r.discount || 0,
              rating: Number(r.rating) || 0,
              ratingCount: r.voters || 0,

              imageUrl: cardImages[idx % cardImages.length],
              logoUrl: logos[idx % logos.length],
            }}
          />
        ))}
      </div>
    </section>
  );
}

export default RestaurantList;
