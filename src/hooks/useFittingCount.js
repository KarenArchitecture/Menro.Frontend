// src/hooks/useFittingCount.js
import { useLayoutEffect, useState } from "react";

const px = (cs, name, fallback) => {
  const v = parseFloat(cs.getPropertyValue(name));
  return Number.isFinite(v) ? v : fallback;
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
      const thumb = px(cs, "--thumb", 52);
      const gap = px(cs, "--gap", 8);
      const tail = px(cs, "--tail-min", 112);
      const w = el.clientWidth;

      const fitAll = Math.floor((w + gap) / (thumb + gap));
      const fitWithTail = Math.floor((w - tail) / (thumb + gap));
      const n = tailOptional && total <= fitAll ? total : fitWithTail;

      setCount(Math.max(1, Math.min(n, total)));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, total, tailOptional]);

  return count;
}