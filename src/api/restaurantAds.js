import publicAxios from "./publicAxios";

const RESTAURANT_URL = "/restaurant";

export const getFeaturedRestaurants = () =>
    publicAxios.get(`${RESTAURANT_URL}/featured`).then((r) => r.data);

export const getRandomAdBanner = (excludeRestaurantIds = []) =>
    publicAxios.get(`/restaurant/ad-banner/random`, {
        params: { exclude: excludeRestaurantIds.length ? excludeRestaurantIds.join(",") : undefined },
    }).then(r => r.data);

export const postAdImpression = (bannerId) =>
    publicAxios.post(`${RESTAURANT_URL}/ad-banner/${bannerId}/impression`);

export const postAdClick = (bannerId) =>
    publicAxios.post(`${RESTAURANT_URL}/ad-banner/${bannerId}/click`);

export const postCarouselClick = (adId) =>
    publicAxios.post(`${RESTAURANT_URL}/carousel/${adId}/click`);
