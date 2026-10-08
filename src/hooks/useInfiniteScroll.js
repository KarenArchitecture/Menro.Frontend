import { useEffect, useState } from "react";

/**
 * خروجی رو به‌عنوان ref به یک div خالی (sentinel) ته لیست بده.
 * وقتی sentinel نزدیک دید اومد، صفحه‌ی بعد لود میشه.
 * برای اسکرول افقی، rootRef رو بده (کانتینر اسکرول) و rootMargin افقی.
 */
export default function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  rootRef = null,
  rootMargin = "600px 0px",
}) {
  const [node, setNode] = useState(null);

  useEffect(() => {
    if (!node || !hasNextPage) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { root: rootRef?.current ?? null, rootMargin, threshold: 0 },
    );

    io.observe(node);
    return () => io.disconnect();
  }, [node, hasNextPage, isFetchingNextPage, fetchNextPage, rootRef, rootMargin]);

  return setNode;
}