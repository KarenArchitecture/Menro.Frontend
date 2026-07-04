import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getFavoriteFoodIds,
    toggleFavoriteFood,
    getUserFavorites,
    } from "../api/favorites";

/* -----------------------------
    QUERY KEYS (centralized)
------------------------------ */
export const favoriteKeys = {
    all: ["favorites"],
    ids: () => [...favoriteKeys.all, "ids"],
    list: () => [...favoriteKeys.all, "list"],
};

/* -----------------------------
    GET FAVORITE IDS (lightweight)
------------------------------ */
export const useFavoriteIds = (enabled = true) => {
    return useQuery({
        queryKey: favoriteKeys.ids(),
        queryFn: getFavoriteFoodIds,
        enabled,
        staleTime: 1000 * 60 * 5,
        retry: false,
    });
};

/* -----------------------------
    FULL FAVORITE LIST
------------------------------ */
export const useFavoriteFoods = () => {
    return useQuery({
        queryKey: favoriteKeys.list(),
        queryFn: getUserFavorites,
        staleTime: 1000 * 60 * 2,
    });
};

/* -----------------------------
    TOGGLE FAVORITE (OPTIMISTIC)
------------------------------ */
export const useToggleFavorite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: toggleFavoriteFood,

        // optimistic update
        onMutate: async (foodId) => {
        await queryClient.cancelQueries({ queryKey: favoriteKeys.ids() });

        const previousIds = queryClient.getQueryData(favoriteKeys.ids()) || [];

        const isFav = previousIds.includes(foodId);

        const nextIds = isFav
            ? previousIds.filter((id) => id !== foodId)
            : [...previousIds, foodId];

        queryClient.setQueryData(favoriteKeys.ids(), nextIds);

        return { previousIds };
        },

        onError: (_err, _foodId, context) => {
        queryClient.setQueryData(
            favoriteKeys.ids(),
            context?.previousIds || []
        );
        },

        onSuccess: () => {
        // sync full list in background
        queryClient.invalidateQueries({ queryKey: favoriteKeys.list() });
        },

        onSettled: () => {
        queryClient.invalidateQueries({ queryKey: favoriteKeys.ids() });
        },
    });
};

/* -----------------------------
    HELPER HOOK: check is favorite
------------------------------ */
export const useIsFavorite = (foodId) => {
    const { data } = useFavoriteIds();

    return {
        isFavorite: data?.includes(foodId) ?? false,
    };
};