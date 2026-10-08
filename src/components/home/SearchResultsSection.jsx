import React, { useState } from "react";
import SectionHeader from "../common/SectionHeader";
import SearchResultsIcon from "../icons/SearchResultsIcon";
import RestaurantList from "./RestaurantList";
import PopularFoodAndAdBannerLazyList from "./PopularFoodAndAdBannerLazyList";
import SearchEmptyState from "./SearchEmptyState";

// این کامپوننت رو با key={query} صدا بزن تا با هر جستجوی جدید state ریست بشه
export default function SearchResultsSection({ query, categoryId = null }) {
  // هر کدوم: null (هنوز نامعلوم) یا { count, hasMore }
  const [restaurants, setRestaurants] = useState(null);
  const [foods, setFoods] = useState(null);

  const bothKnown = restaurants !== null && foods !== null;
  const total = (restaurants?.count ?? 0) + (foods?.count ?? 0);
  const anyMore = Boolean(restaurants?.hasMore || foods?.hasMore);
  const showGlobalEmpty = bothKnown && total === 0;

  return (
    <>
      <SectionHeader
        icon={<SearchResultsIcon />}
        title="نتایج جستجو"
        meta={
          bothKnown
            ? `(${total.toLocaleString("fa-IR")}${anyMore ? "+" : ""} نتیجه)`
            : undefined
        }
      />

      {(restaurants === null || restaurants.count > 0) && (
        <RestaurantList
          searchQuery={query}
          categoryId={categoryId}
          onSearchCount={setRestaurants}
        />
      )}

      {(foods === null || foods.count > 0) && (
        <PopularFoodAndAdBannerLazyList
          searchQuery={query}
          categoryId={categoryId}
          showAds={false}
          onSearchCount={setFoods}
        />
      )}

      {showGlobalEmpty && <SearchEmptyState />}
    </>
  );
}