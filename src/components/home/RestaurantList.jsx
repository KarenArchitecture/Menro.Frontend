// src/components/home/RestaurantList.jsx
import React from "react";
import SectionHeader from "../common/SectionHeader";
import RestaurantCard from "./RestaurantCard";
import { useQuery } from "@tanstack/react-query";
import { getRandomRestaurants } from "../../api/restaurants";
import LoadingSpinner from "../common/LoadingSpinner";
import StarIcon2 from "../icons/StarIcon2";
import publicAxios from "../../api/publicAxios";

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

  const apiOrigin = new URL(publicAxios.defaults.baseURL).origin;
  const appOrigin = window.location.origin;
  const toAssetUrl = (url, fallback) => {
    const candidate = url || fallback;
    if (!candidate) return undefined;
    if (candidate.startsWith("http://") || candidate.startsWith("https://")) return candidate;
    const withSlash = candidate.startsWith("/") ? candidate : `/${candidate}`;
    if (withSlash.startsWith("/img/"))     return `${apiOrigin}${withSlash}`;   // from backend wwwroot/img
    if (withSlash.startsWith("/images/"))  return `${appOrigin}${withSlash}`;   // from frontend public/images
    return `${appOrigin}${withSlash}`;                                           // default to frontend
  };

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

              imageUrl: toAssetUrl(r.bannerImageUrl, "/images/res-card-1.png"),
              logoUrl: toAssetUrl(r.logoImageUrl, "/images/logo-green.png"),
              isOpen: !!r.isOpen, 
            }}
          />
        ))}
      </div>
    </section>
  );
}

export default RestaurantList;
