// src/hooks/useFittingCount.js
import { useLayoutEffect, useState } from "react";

// مقدار یک CSS variable را به px تبدیل می‌کند (هم px و هم rem پشتیبانی می‌شود)
const toPx = (raw, fallback, rootSize) => {
  const value = parseFloat(raw);
  if (!Number.isFinite(value)) return fallback;
  return String(raw).trim().endsWith("rem") ? value * rootSize : value;
};

// اندازه‌ها را از CSS variable های خود المنت می‌خواند (--thumb, --gap, --tail-min)
// تا CSS تنها منبع حقیقت بماند.
export default function useFittingCount(ref, { total, tailOptional = false }) {
  const [count, setCount] = useState(total);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || total === 0) return;

    const measure = () => {
      const cs = getComputedStyle(el);
      const rootSize =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;

      const thumb = toPx(cs.getPropertyValue("--thumb"), 56, rootSize);
      const gap = toPx(cs.getPropertyValue("--gap"), 10, rootSize);
      const tail = toPx(cs.getPropertyValue("--tail-min"), 114, rootSize);
      const width = el.clientWidth;

      const fitAll = Math.floor((width + gap) / (thumb + gap));
      const fitWithTail = Math.floor((width - tail) / (thumb + gap));
      const n = tailOptional && total <= fitAll ? total : fitWithTail;

      setCount(Math.max(1, Math.min(n, total)));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, total, tailOptional]);

  return count;
}