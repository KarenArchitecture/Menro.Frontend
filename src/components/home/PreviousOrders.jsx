// src/components/home/PreviousOrders.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import SectionHeader from "../common/SectionHeader";
import ReceiptIcon from "../icons/ReceiptIcon";
import FoodCard from "./FoodCard";
import StateMessage from "../common/StateMessage";
import { getUserRecentOrders } from "../../api/orders";
import { PreviousOrdersSkeleton } from "./HomeSkeletons";

function PreviousOrders() {
  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");
  const hasToken = !!token;

  const PREVIEW_COUNT = 8;
  const PROBE_COUNT = PREVIEW_COUNT + 1; // 9 (to detect "has more")

  const { data = [], isLoading, isError, error } = useQuery({
    queryKey: ["userRecentOrders", token, PROBE_COUNT],
    queryFn: () => getUserRecentOrders(PROBE_COUNT),
    enabled: hasToken,
    refetchOnMount: "always",
    staleTime: 60 * 1000,
    retry: (tries, err) =>
      err?.response?.status === 401 ? false : tries < 2,
  });

  const hasMore = data.length > PREVIEW_COUNT;
  const items = data.slice(0, PREVIEW_COUNT);

  const header = (
    <SectionHeader
      icon={<ReceiptIcon />}
      title="سفارش‌های پیشین"
      linkText="مشاهده همه"
      to={hasToken && hasMore ? "/orders" : undefined}
    />
  );

  // ───────────── Unauthenticated CTA (full-width) ─────────────
  if (!hasToken) {
    return (
      <section className="previous-orders unauth-cta">
        <SectionHeader
          icon={<ReceiptIcon />}
          title="سفارش‌های پیشین"
          linkText="ورود"
          to="/login"
        />

        <div className="unauth-cta__inner">
          <p className="unauth-cta__title">
            برای مشاهده این بخش به حساب کاربری خود وارد شوید
          </p>
          <a className="unauth-cta__button" href="/login">
            ورود / عضویت
          </a>
        </div>
      </section>
    );
  }

  // ───────────── Loading state ─────────────
  if (isLoading) {
    return <PreviousOrdersSkeleton count={4} />;
  }

  // ───────────── Error state ─────────────
  if (isError) {
    const status = error?.response?.status;

    // Token invalid → mirror unauth CTA
    if (status === 401) {
      return (
        <section className="previous-orders unauth-cta">
          <SectionHeader
            icon={<ReceiptIcon />}
            title="سفارش‌های پیشین"
            linkText="ورود"
            to="/login"
          />
          <div className="unauth-cta__inner">
            <p className="unauth-cta__title">
              برای مشاهده این بخش به حساب کاربری خود وارد شوید
            </p>
            <a className="unauth-cta__button" href="/login">
              ورود / عضویت
            </a>
          </div>
        </section>
      );
    }

    // Other errors → professional error message
    return (
      <section className="previous-orders">
        <SectionHeader icon={<ReceiptIcon />} title="سفارش‌های پیشین" />
        <StateMessage kind="error" title="خطا در دریافت سفارش‌ها">
          خطایی در دریافت سفارش‌های پیشین رخ داده است.
          <div className="state-message__action">
            <button onClick={() => window.location.reload()}>
              دوباره تلاش کنید
            </button>
          </div>
        </StateMessage>
      </section>
    );
  }

  // ───────────── Empty state ─────────────
  if (items.length === 0) {
    return (
      <section className="previous-orders">
        <SectionHeader icon={<ReceiptIcon />} title="سفارش‌های پیشین" />
        <StateMessage kind="empty" title="سفارشی یافت نشد">
          شما هنوز هیچ سفارشی ثبت نکرده‌اید.
        </StateMessage>
      </section>
    );
  }

  // ───────────── Data loaded ─────────────
  return (
    <section className="previous-orders">
      {header}
      <div className="food-cards-container">
        {items.map((item) => (
          <FoodCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export default PreviousOrders;