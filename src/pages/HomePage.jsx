import { useState, useEffect } from "react";
import Header from "../components/common/Header";
import Carousel from "../components/home/Carousel";
import RestaurantList from "../components/home/RestaurantList";
import AdBanner from "../components/home/AdBanner";
import PreviousOrders from "../components/home/PreviousOrders";
import PopularFoodLazyList from "../components/home/PopularFoodLazyList";
import AuthActions from "../components/common/AuthActions";

export default function HomePage() {
  console.log("🏠 Home rendered");
  useEffect(() => {
    console.log("🔹 Home mounted");
    return () => console.log("🔸 Home unmounted");
  }, []);
  return (
    <>
      <Header />
      <main className="content">
        <AuthActions />
        <Carousel />
        <RestaurantList />
        <AdBanner />
        <PreviousOrders />
        <PopularFoodLazyList />
      </main>
    </>
  );
}
