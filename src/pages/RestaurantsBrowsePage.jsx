import React, { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import RestaurantCard from "../components/home/RestaurantCard";
import ShimmerRow from "../components/common/ShimmerRow";
import StateMessage from "../components/common/StateMessage";
import { getRestaurantsPage } from "../api/restaurants";
import publicAxios from "../api/publicAxios";
import useDocumentTitle from "../hooks/useDocumentTitle";

function RestaurantCardSkeleton() {
  return <div className="restaurant-card-skeleton" />;
}

export default function RestaurantsBrowsePage() {
  useDocumentTitle("جستجوی رستوران‌ها");
  const take = 6;

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["restaurantsBrowse", take],
    queryFn: ({ pageParam }) =>
      getRestaurantsPage({ take, cursor: pageParam ?? null }),
    initialPageParam: null,
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? lastPage?.nextCursor : undefined,
    staleTime: 60_000,
    retry: 1,
  });

  const items = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.items ?? []),
    [data],
  );

  // sentinel observer
  const sentinelRef = useRef(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "600px 0px", // ✅ prefetch when user is ~600px away
      },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="page-container">
        <ShimmerRow height={240} style={{ margin: "16px 0" }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-container">
        <StateMessage kind="error" title="خطا در دریافت رستوران‌ها">
          خطایی در دریافت اطلاعات رستوران‌ها رخ داده است.
          <div className="state-message__action">
            <button onClick={() => refetch()}>دوباره تلاش کنید</button>
          </div>
        </StateMessage>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="page-container">
        <StateMessage kind="empty" title="موردی یافت نشد">
          رستورانی برای نمایش وجود ندارد.
        </StateMessage>
      </div>
    );
  }

  return (
    <div className="page-container">
      <section className="restaurants">
        <div className="cards-container cards-container--grid">
          {items.map((r) => (
            <div key={r.id} className="fade-in">
              <RestaurantCard
                restaurant={{
                  name: r.name,
                  category: r.category,
                  openTime: r.openTime,
                  closeTime: r.closeTime,
                  discount: r.discount || 0,
                  rating: Number(r.rating) || 0,
                  voters: r.voters || 0,
                  bannerImageUrl: r.bannerImageUrl,
                  logoImageUrl: r.logoImageUrl,
                  isOpen: !!r.isOpen,
                  slug: r.slug,
                }}
              />
            </div>
          ))}
        </div>

        <div ref={sentinelRef} style={{ height: 1 }} />
      </section>
    </div>
  );
}
