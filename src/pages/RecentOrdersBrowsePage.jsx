import React, { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import SectionHeader from "../components/common/SectionHeader";
import ReceiptIcon from "../components/icons/ReceiptIcon";
import FoodCard from "../components/home/FoodCard";
import StateMessage from "../components/common/StateMessage";
import ShimmerRow from "../components/common/ShimmerRow";
import { browseUserRecentOrders } from "../api/orders";
import useDocumentTitle from "../hooks/useDocumentTitle";

const TAKE = 6;

export default function RecentOrdersBrowsePage() {
  useDocumentTitle("تاریخچه سفارش‌ها");
  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");
  const hasToken = !!token;

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["userRecentOrdersBrowse", token, TAKE],
    enabled: hasToken,
    initialPageParam: null, // cursor
    queryFn: ({ pageParam }) =>
      browseUserRecentOrders({ take: TAKE, cursor: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? lastPage?.nextCursor : undefined,
    refetchOnMount: "always",
    staleTime: 60 * 1000,
    retry: (tries, err) => (err?.response?.status === 401 ? false : tries < 2),
  });

  const items = useMemo(() => {
    const flat = (data?.pages ?? []).flatMap((p) => p?.items ?? []);
    // optional: de-dupe by id (safe guard)
    const seen = new Set();
    return flat.filter((x) => {
      if (!x?.id) return true;
      if (seen.has(x.id)) return false;
      seen.add(x.id);
      return true;
    });
  }, [data]);

  const header = (
    <SectionHeader
      icon={<ReceiptIcon />}
      title="سفارش‌های پیشین"
      linkText="بازگشت"
      to="/"
    />
  );

  // Infinite scroll sentinel
  const loadMoreRef = useRef(null);
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const el = loadMoreRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: "400px", threshold: 0 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (!hasToken) {
    return (
      <main className="content">
        <section className="previous-orders unauth-cta">
          {header}
          <div className="unauth-cta__inner">
            <p className="unauth-cta__title">
              لطفاً برای مشاهده این بخش به حساب کاربری خود وارد شوید
            </p>
            <Link className="unauth-cta__button" to="/login">
              ورود / عضویت
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="content">
        <section className="previous-orders">
          {header}
          <ShimmerRow height={220} style={{ margin: "16px 0" }} />
        </section>
      </main>
    );
  }

  if (isError) {
    const status = error?.response?.status;

    if (status === 401) {
      return (
        <main className="content">
          <section className="previous-orders unauth-cta">
            {header}
            <div className="unauth-cta__inner">
              <p className="unauth-cta__title">
                لطفاً برای مشاهده این بخش به حساب کاربری خود وارد شوید
              </p>
              <Link className="unauth-cta__button" to="/login">
                ورود / عضویت
              </Link>
            </div>
          </section>
        </main>
      );
    }

    return (
      <main className="content">
        <section className="previous-orders">
          {header}
          <StateMessage kind="error" title="خطا در دریافت سفارش‌ها">
            خطایی در دریافت سفارش‌های پیشین رخ داده است.
            <div className="state-message__action">
              <button onClick={() => refetch()}>دوباره تلاش کنید</button>
            </div>
          </StateMessage>
        </section>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="content">
        <section className="previous-orders">
          {header}
          <StateMessage kind="empty" title="سفارشی یافت نشد">
            شما هنوز هیچ سفارشی ثبت نکرده‌اید.
          </StateMessage>
        </section>
      </main>
    );
  }

  return (
    <main className="content">
      <section className="previous-orders">
        {header}

        <div className="food-cards-container food-cards-container--search ">
          {items.map((item) => (
            <div key={item.id} className="food-card-wrap--search">
              <FoodCard item={item} />
            </div>
          ))}
        </div>

        {/* sentinel */}
        <div ref={loadMoreRef} style={{ height: 1 }} />

        {/* loading indicator */}
        {isFetchingNextPage && (
          <ShimmerRow height={220} style={{ margin: "16px 0" }} />
        )}

        {/* optional fallback button */}
        {hasNextPage && !isFetchingNextPage && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "16px 0",
            }}
          >
            <button onClick={() => fetchNextPage()}>بارگذاری بیشتر</button>
          </div>
        )}
      </section>
    </main>
  );
}
