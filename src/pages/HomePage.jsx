// import Header from "../components/common/Header";
import React, { useEffect } from "react";
import Header from "../components/common/Header";
import Carousel from "../components/home/Carousel";
import RestaurantList from "../components/home/RestaurantList";
import PreviousOrders from "../components/home/PreviousOrders";
import PopularFoodAndAdBannerLazyList from "../components/home/PopularFoodAndAdBannerLazyList";
import AuthActions from "../components/common/AuthActions";

export default function HomePage() {
  useEffect(() => {
    // reset per-page banner memory so each visit can show fresh random ads
    window.__menroAdExcludes = [];
  }, []);
  return (
    <>
      <Header />
      <main className="content">
        <AuthActions />
        <Carousel />
        <RestaurantList />
        <PreviousOrders />
        <PopularFoodAndAdBannerLazyList />  {/* ← contains both popular sections + ad banners */}
      </main>
    </>
  );
}
