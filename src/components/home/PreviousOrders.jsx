// src/components/home/PreviousOrders.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import SectionHeader from "../common/SectionHeader";
import WideRestaurantCard from "../home/WideRestaurantCard";
import ReceiptIcon from "../icons/ReceiptIcon";
import { getUserRecentOrders } from "../../api/restaurants";

function PreviousOrders() {
  const token = localStorage.getItem("token");
  const hasToken = !!token;

  const { data = [], isLoading, isError, error } = useQuery({
    queryKey: ["userRecentOrders", token, 8], 
    queryFn: () => getUserRecentOrders(8),
    enabled: hasToken,                              // only run when token exists
    refetchOnMount: "always",
    staleTime: 60 * 1000,
    retry: (tries, err) => (err?.response?.status === 401 ? false : tries < 2),
  });

  if (!hasToken) return null; // hide section if not logged in

  if (isLoading) {
    return (
      <section className="previous-orders">
        <SectionHeader icon={<ReceiptIcon />} title="سفارش‌های پیشین" />
        <div className="wide-carousel-cards">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[240px] h-[120px] bg-gray-200/60 animate-pulse rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    const msg =
      error?.response?.status === 401
        ? "برای مشاهده سفارش‌ها ابتدا وارد شوید."
        : "خطا در دریافت سفارش‌های پیشین.";
    return (
      <section className="previous-orders">
        <SectionHeader icon={<ReceiptIcon />} title="سفارش‌های پیشین" />
        <p className="text-red-600 text-sm">{msg}</p>
      </section>
    );
  }

  if (data.length === 0) {
    return (
      <section className="previous-orders">
        <SectionHeader icon={<ReceiptIcon />} title="سفارش‌های پیشین" />
        <p className="text-gray-500 text-sm">سفارشی یافت نشد</p>
      </section>
    );
  }

  return (
    <section className="previous-orders">
      <SectionHeader icon={<ReceiptIcon />} title="سفارش‌های پیشین" />
      <div className="wide-carousel-cards">
        {data.map((dto) => {
          const mapped = {
            imageUrl: dto.bannerImageUrl,
            discount: dto.discount ?? 0,
            hours: `${dto.openTime}–${dto.closeTime}`,
            logoUrl: "/img/res-cards.png", // no logo in DTO → default
            name: dto.name,
            rating: dto.rating,
            ratingCount: dto.voters,
            type: dto.category,
          };
          return <WideRestaurantCard key={dto.id} order={mapped} />;
        })}
      </div>
    </section>
  );
}

export default PreviousOrders;
