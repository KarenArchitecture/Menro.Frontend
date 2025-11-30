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
  } = useQuery({
    queryKey: ["randomRestaurants"],
    queryFn: getRandomRestaurants,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className="ui-alert ui-alert--error">خطای بارگذاری رستوران‌ها.</div>;
  if (!restaurants || restaurants.length === 0)
    return <div className="ui-alert ui-alert--muted">موردی یافت نشد.</div>;

  const apiOrigin = new URL(publicAxios.defaults.baseURL).origin;
  const appOrigin = window.location.origin;
  const toAssetUrl = (url, fallback) => {
    const candidate = url || fallback;
    if (!candidate) return undefined;
    if (candidate.startsWith("http://") || candidate.startsWith("https://")) return candidate;
    const withSlash = candidate.startsWith("/") ? candidate : `/${candidate}`;
    if (withSlash.startsWith("/img/")) return `${apiOrigin}${withSlash}`;
    if (withSlash.startsWith("/images/")) return `${appOrigin}${withSlash}`;
    return `${appOrigin}${withSlash}`;
  };

  return (
    <section className="restaurants">
      <SectionHeader icon={<StarIcon2 />} title="رستوران‌ و کافه‌ها" />
      <div className="cards-container">
        {restaurants.map((r) => (
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
              slug: r.slug, // ✅ pass slug explicitly
            }}
          />
        ))}
      </div>
    </section>
  );
}

export default RestaurantList;
