// src/hooks/useScroller.js
import { useLayoutEffect, useState } from "react";

/**
 * Returns the element that actually scrolls the page:
 *  - `.app-shell__content` if it has overflow-y auto/scroll
 *  - otherwise `window`
 *
 * Every ScrollTrigger on the landing page should use this same value,
 * otherwise some triggers listen to one scroller while the page scrolls in
 * another, and they fire at the wrong time (or never).
 */
export function detectScroller() {
  if (typeof document === "undefined") return null;

  const el = document.querySelector(".app-shell__content");
  if (el) {
    const { overflowY } = window.getComputedStyle(el);
    if (overflowY === "auto" || overflowY === "scroll") return el;
  }

  return window;
}

export default function useScroller() {
  // null on the first render, then the detected scroller before first paint.
  const [scroller, setScroller] = useState(null);

  useLayoutEffect(() => {
    const update = () => setScroller(detectScroller());
    update();

    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return scroller;
}