// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/common/Header";
import Carousel from "../components/home/Carousel";
import RestaurantList from "../components/home/RestaurantList";
import PreviousOrders from "../components/home/PreviousOrders";
import PopularFoodAndAdBannerLazyList from "../components/home/PopularFoodAndAdBannerLazyList";
import SearchResultsSection from "../components/home/SearchResultsSection";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function HomePage() {
  useDocumentTitle("خانه");
  const [searchQuery, setSearchQuery] = useState("");
  const trimmedQuery = searchQuery.trim();
  const isSearchActive = Boolean(trimmedQuery);

  useEffect(() => {
    // reset banner/page memory on each visit
    window.__menroAdExcludes = [];
    window.__menroBannerExcludeAdIds = [];
  }, []);

  return (
    <>
      <Header
        onSearchSubmit={setSearchQuery}
        isSearchActive={isSearchActive}
        onBack={() => setSearchQuery("")}
      />

      <main className="content">
        {isSearchActive ? (
          <SearchResultsSection key={trimmedQuery} query={searchQuery} />
        ) : (
          <>
            <Carousel />
            <RestaurantList />
            <PreviousOrders />
            <PopularFoodAndAdBannerLazyList showAds />
          </>
        )}
      </main>
    </>
  );
}