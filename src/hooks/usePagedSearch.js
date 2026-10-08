import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { publicSearchPaged } from "../api/search";

export default function usePagedSearch({
  term,
  type, // "Restaurant" | "Food"
  categoryId = null,
  take = 12,
  enabled = true,
  map, // باید یک تابع ثابت (بیرون از کامپوننت) باشه
}) {
  const q = (term || "").trim();

  const query = useInfiniteQuery({
    queryKey: ["pagedSearch", type, categoryId, q, take],
    enabled: enabled && q.length >= 2,
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      publicSearchPaged({ term: q, type, categoryId, cursor: pageParam, take }),
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? lastPage?.nextCursor : undefined,
    staleTime: 30_000,
    retry: 1,
  });

  const items = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const page of query.data?.pages ?? []) {
      for (const x of page?.items ?? []) {
        if (seen.has(x.id)) continue;
        seen.add(x.id);
        out.push(map ? map(x) : x);
      }
    }
    return out;
  }, [query.data, map]);

  return {
    items,
    isLoading: query.isLoading,
    isError: query.isError,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}