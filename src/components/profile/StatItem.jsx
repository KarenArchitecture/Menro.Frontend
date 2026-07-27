import { useEffect, useState } from "react";

export default function StatItem({ value = 0, label }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800; // ms
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutCubic (feels much better than linear)
      const eased = 1 - Math.pow(1 - progress, 3);

      const current = Math.floor(eased * value);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value); // ensure exact final value
      }
    }

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <div className="stat-item">
      <div className="stat-item__value">
        {displayValue.toLocaleString("fa-IR")}
      </div>
      <div className="stat-item__label">{label}</div>
    </div>
  );
}
