import React from "react";
import { useQuery } from "@tanstack/react-query";
import SectionHeader from "../common/SectionHeader";
import WideRestaurantCard from "../home/WideRestaurantCard";
import ReceiptIcon from "../icons/ReceiptIcon";
import { getUserRecentOrders } from "../../api/restaurant";

function PreviousOrders() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["userRecentOrders"],
    queryFn: getUserRecentOrders,
  });

  if (isLoading) return <p>در حال بارگذاری سفارش‌ها...</p>;
  if (isError) return <p>خطا در دریافت سفارش‌های پیشین: {error.message}</p>;

  if (!data || data.length === 0) {
    return <p>سفارشی یافت نشد</p>;
  }

  return (
    <section className="previous-orders">
      <SectionHeader icon={<ReceiptIcon />} title="سفارش‌های پیشین" />
      <div className="wide-carousel-cards">
        {data.map((order) => (
          <WideRestaurantCard key={order.id} order={order} />
        ))}
      </div>
    </section>
  );
}

export default PreviousOrders;
