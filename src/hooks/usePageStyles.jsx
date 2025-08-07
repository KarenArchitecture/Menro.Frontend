// src/hooks/usePageStyles.js
import { useEffect, useState } from "react";

/**
 * Dynamically fetches a CSS file, injects it into <head>,
 * and tells the caller when it's ready.
 *
 * @param {string} stylesheetUrl absolute or public-folder URL
 * @return {boolean} ready  – true once styles are in the DOM
 */
export default function usePageStyles(stylesheetUrl) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetch(stylesheetUrl)
      .then((res) => {
        if (!res.ok) throw new Error("CSS fetch failed");
        return res.text();
      })
      .then((css) => {
        if (!mounted) return;
        const styleEl = document.createElement("style");
        styleEl.id = "page-specific-style";
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
        setReady(true); // ← signal up
      })
      .catch((err) => console.error("usePageStyles:", err));

    return () => {
      mounted = false;
      const styleEl = document.getElementById("page-specific-style");
      if (styleEl) document.head.removeChild(styleEl);
    };
  }, [stylesheetUrl]);

  return ready;
}
