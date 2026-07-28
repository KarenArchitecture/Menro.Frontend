import React from "react";
import { useLocation } from "react-router-dom";
import FoodCard from "../components/home/FoodCard";
import RestaurantCard from "../components/home/RestaurantCard";
import useDocumentTitle from "../hooks/useDocumentTitle";

const foodPlaceholders = [
  {
    id: 1,
    imageUrl: "",
    name: "نام غذا",
    restaurantName: "نام رستوران",
    rating: 4.5,
    voters: 0,
  },
  {
    id: 2,
    imageUrl: "",
    name: "نام غذا",
    restaurantName: "نام رستوران",
    rating: 4.5,
    voters: 0,
  },
  {
    id: 3,
    imageUrl: "",
    name: "نام غذا",
    restaurantName: "نام رستوران",
    rating: 4.5,
    voters: 0,
  },
  {
    id: 4,
    imageUrl: "",
    name: "نام غذا",
    restaurantName: "نام رستوران",
    rating: 4.5,
    voters: 0,
  },
];

const restaurantPlaceholders = [
  {
    name: "نام رستوران",
    type: "باغ رستوران",
    hours: "09:00 تا 21:30",
    discount: 30,
    rating: 4.0,
    ratingCount: 0,
    imageUrl: "/images/res-card-1.png",
    logoUrl: "/images/logo-green.png",
    isOpen: false,
  },
  {
    name: "نام رستوران",
    type: "کافه",
    hours: "10:00 تا 20:30",
    discount: 30,
    rating: 4.0,
    ratingCount: 0,
    imageUrl: "/images/res-card-1.png",
    logoUrl: "/images/logo-green.png",
    isOpen: false,
  },
  {
    name: "نام رستوران",
    type: "مدرن",
    hours: "09:00 تا 21:30",
    discount: 30,
    rating: 4.0,
    ratingCount: 0,
    imageUrl: "/images/res-card-1.png",
    logoUrl: "/images/logo-green.png",
    isOpen: false,
  },
  {
    name: "نام رستوران",
    type: "ایتالیایی",
    hours: "10:00 تا 20:30",
    discount: 30,
    rating: 4.0,
    ratingCount: 0,
    imageUrl: "/images/res-card-1.png",
    logoUrl: "/images/logo-green.png",
    isOpen: false,
  },
];

export default function ShowAllFoodsPage() {
  useDocumentTitle("همه غذاها");
  const { pathname } = useLocation();
  const isRestaurants = pathname.startsWith("/restaurants");

  return (
    <div className="page-container">
      {isRestaurants ? (
        <section className="restaurants">
          <div className="cards-container cards-container--grid">
            {restaurantPlaceholders.map((r, i) => (
              <RestaurantCard key={i} restaurant={r} />
            ))}
          </div>
        </section>
      ) : (
        <div className="food-cards-container food-cards-container--search">
          {foodPlaceholders.map((item) => (
            <div key={item.id} className="food-card-wrap--search">
              <FoodCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
