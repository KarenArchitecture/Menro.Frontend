// src/hooks/usePageStyles.js
import { useEffect, useRef, useState } from "react";

export default function usePageStyles(stylesheetUrl) {
  const [ready, setReady] = useState(false);
  const linkRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    setReady(false);

    if (linkRef.current) {
      linkRef.current.remove();
      linkRef.current = null;
    }

    const link = document.createElement("link");

    link.rel = "stylesheet";
    link.href = stylesheetUrl;
    link.dataset.pageStyle = "true";

    const markReady = () => {
      if (cancelled) return;

      requestAnimationFrame(() => {
        if (cancelled) return;

        setReady(true);

        // Helps GSAP / ScrollTrigger / layout-measured sections
        window.dispatchEvent(new Event("resize"));
      });
    };

    link.onload = markReady;

    link.onerror = (err) => {
      console.error("usePageStyles link load failed:", err);

      markReady();
    };

    document.head.appendChild(link);
    linkRef.current = link;

    // Browser-cache fallback:
    requestAnimationFrame(() => {
      if (cancelled) return;

      try {
        if (link.sheet) {
          markReady();
        }
      } catch {
        // Ignore and wait for onload/onerror.
      }
    });

    return () => {
      cancelled = true;

      if (linkRef.current) {
        linkRef.current.remove();
        linkRef.current = null;
      }
    };
  }, [stylesheetUrl]);

  return ready;
}
