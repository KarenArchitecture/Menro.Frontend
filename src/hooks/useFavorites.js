import { useQuery } from "@tanstack/react-query";
import { getFavoriteFoodIds } from "../api/favorites";

export function useFavoriteIds() {
    return useQuery({
        queryKey: ["favorite-ids"],
        queryFn: getFavoriteFoodIds,
        staleTime: 1000 * 60 * 5, // 5 min
    });
}