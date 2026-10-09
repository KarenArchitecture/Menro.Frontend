function normalizeTargetUrl(raw) {
  const t = raw?.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("/")) return t;
  return null;
}

// نتیجه‌ی جستجو -> شکلی که RestaurantCard می‌خواد
export function mapSearchRestaurant(x) {
  return {
    id: x.id,
    name: x.title,
    category: x.category ?? "",
    openTime: x.openTime ?? null,
    closeTime: x.closeTime ?? null,
    discount: x.discount ?? 0,
    rating: Number(x.rating) || 0,
    voters: x.voters ?? 0,
    bannerImageUrl: x.imageUrl,
    logoImageUrl: x.logoImageUrl,
    isOpen: !!x.isOpen,
    slug: x.restaurantSlug,
  };
}

// نتیجه‌ی جستجو -> شکلی که FoodCard می‌خواد
export function mapSearchFood(x) {
  return {
    id: x.id,
    name: x.title,
    imageUrl: x.imageUrl,
    restaurantName: x.subtitle,
    restaurantId: x.restaurantId,
    restaurantSlug: x.restaurantSlug,
    restaurantPath:
      normalizeTargetUrl(x.targetUrl) ||
      (x.restaurantSlug ? `/restaurant/${x.restaurantSlug}` : undefined),
    rating: Number(x.rating) || 0,
    voters: x.voters ?? 0,
    price: Number(x.price) || 0,
  };
}