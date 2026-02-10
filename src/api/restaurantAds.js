import publicAxios from "./publicAxios";

const RESTAURANT_URL = "/restaurant";

export const getFeaturedRestaurants = (take = 10) =>
    publicAxios
        .get(`${RESTAURANT_URL}/featured`, {
        params: { take },
        })
        .then((r) => r.data);

// exclude = AdIds (RestaurantAd.Id)
export const getRandomAdBanner = async (excludeAdIds = []) => {
    const res = await publicAxios.get(`${RESTAURANT_URL}/ad-banner/random`, {
        params: {
        exclude: excludeAdIds.length ? excludeAdIds.join(",") : undefined,
        },
        validateStatus: (s) => (s >= 200 && s < 300) || s === 204,
    });

    if (res.status === 204) return null;
    return res.data;
};

// AdId only
export const postAdImpression = (adId) =>
    publicAxios.post(`${RESTAURANT_URL}/ad-banner/${adId}/impression`);

export const postAdClick = (adId) =>
    publicAxios.post(`${RESTAURANT_URL}/ad-banner/${adId}/click`);

export const postCarouselClick = (adId) =>
    publicAxios.post(`${RESTAURANT_URL}/carousel/${adId}/click`);
