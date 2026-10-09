// src/pages/RecentOrdersBrowsePage.jsx
import React, { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import SectionHeader from "../components/common/SectionHeader";
import BrowsePageLayout from "../components/common/BrowsePageLayout";
import ReceiptIcon from "../components/icons/ReceiptIcon";
import SearchResultsIcon from "../components/icons/SearchResultsIcon";
import FoodCard from "../components/home/FoodCard";
import SearchEmptyState from "../components/home/SearchEmptyState";
import StateMessage from "../components/common/StateMessage";
import ShimmerRow from "../components/common/ShimmerRow";
import { browseUserRecentOrders } from "../api/orders";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { normalizeFa } from "../utils/normalizeFa";

const TAKE = 6;

export default function RecentOrdersBrowsePage() {
  useDocumentTitle("تاریخچه سفارش‌ها");

  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");
  const hasToken = !!token;

  const [searchQuery, setSearchQuery] = useState("");
  const q = useMemo(() => normalizeFa(searchQuery), [searchQuery]);
  const isSearchActive = Boolean(q);

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
    queryKey: ["userRecentOrdersBrowse", token, TAKE, q],
    enabled: hasToken,
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      browseUserRecentOrders({ take: TAKE, cursor: pageParam, q }),
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? lastPage?.nextCursor : undefined,
    refetchOnMount: "always",
    staleTime: 60 * 1000,
    retry: (tries, err) => (err?.response?.status === 401 ? false : tries < 2),
  });

  const items = useMemo(() => {
    const flat = (data?.pages ?? []).flatMap((p) => p?.items ?? []);
    const seen = new Set();
    return flat.filter((x) => {
      if (!x?.id) return true;
      if (seen.has(x.id)) return false;
      seen.add(x.id);
      return true;
    });
  }, [data]);

  const sentinelRef = useInfiniteScroll({
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  const header = (
    <SectionHeader
      icon={isSearchActive ? <SearchResultsIcon /> : <ReceiptIcon />}
      title={isSearchActive ? "نتایج جستجو" : "سفارش‌های پیشین"}
    />
  );

  let body;

  if (!hasToken || error?.response?.status === 401) {
    body = (
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
    );
  } else if (isLoading) {
    body = (
      <section className="previous-orders">
        {header}
        <ShimmerRow height={220} style={{ margin: "16px 0" }} />
      </section>
    );
  } else if (isError) {
    body = (
      <section className="previous-orders">
        {header}
        <StateMessage kind="error" title="خطا در دریافت سفارش‌ها">
          خطایی در دریافت سفارش‌های پیشین رخ داده است.
          <div className="state-message__action">
            <button onClick={() => refetch()}>دوباره تلاش کنید</button>
          </div>
        </StateMessage>
      </section>
    );
  } else if (items.length === 0) {
    body = (
      <section className="previous-orders">
        {header}
        {isSearchActive ? (
          <SearchEmptyState />
        ) : (
          <StateMessage kind="empty" title="سفارشی یافت نشد">
            شما هنوز هیچ سفارشی ثبت نکرده‌اید.
          </StateMessage>
        )}
      </section>
    );
  } else {
    body = (
      <section className="previous-orders">
        {header}

        <div className="food-cards-container food-cards-container--search">
          {items.map((item) => (
            <div key={item.id} className="food-card-wrap--search">
              <FoodCard item={item} />
            </div>
          ))}
        </div>

        {hasNextPage && (
          <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />
        )}

        {isFetchingNextPage && (
          <ShimmerRow height={220} style={{ margin: "16px 0" }} />
        )}
      </section>
    );
  }

  return (
    <BrowsePageLayout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      {body}
    </BrowsePageLayout>
  );
}