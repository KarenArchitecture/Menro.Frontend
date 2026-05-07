import React, { useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import RestaurantCard from "../components/home/RestaurantCard";
import ShimmerRow from "../components/common/ShimmerRow";
import StateMessage from "../components/common/StateMessage";
import { getRestaurantsPage } from "../api/restaurants";
import publicAxios from "../api/publicAxios";

function RestaurantCardSkeleton() {
    return <div className="restaurant-card-skeleton" />;
}

export default function RestaurantsBrowsePage() {
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
        [data]
    );

    // asset resolver (same pattern you already use)
    const apiOrigin = useMemo(() => new URL(publicAxios.defaults.baseURL).origin, []);
    const appOrigin = useMemo(() => window.location.origin, []);

    const toAssetUrl = (url, fallback) => {
        const candidate = url || fallback;
        if (!candidate) return undefined;
        if (/^https?:\/\//i.test(candidate)) return candidate;
        const withSlash = candidate.startsWith("/") ? candidate : `/${candidate}`;
        if (withSlash.startsWith("/img/")) return `${apiOrigin}${withSlash}`;
        if (withSlash.startsWith("/images/")) return `${appOrigin}${withSlash}`;
        return `${appOrigin}${withSlash}`;
    };

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
        }
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
                    type: r.category,
                    hours: `${r.openTime ?? "نامشخص"} تا ${r.closeTime ?? "نامشخص"}`,
                    discount: r.discount || 0,
                    rating: Number(r.rating) || 0,
                    ratingCount: r.voters || 0,
                    imageUrl: toAssetUrl(r.bannerImageUrl, "/images/res-card-1.png"),
                    logoUrl: toAssetUrl(r.logoImageUrl, "/images/logo-green.png"),
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