import React, { useRef, useEffect } from "react";

export default function StatsSection() {
  const sectionRef = useRef(null);

  const stats = [
    {
      id: 1,
      icon: "/images/landing-stats-1.png",
      number: "+1,700",
      text: "رستوران ثبت شده",
    },
    {
      id: 2,
      icon: "/images/landing-stats-2.png",
      number: "+69,000",
      text: "مخاطب فعال",
    },
    {
      id: 3,
      icon: "/images/landing-stats-3.png",
      number: "+1,000,000",
      text: "سفارش های انجام شده",
    },
    {
      id: 4,
      icon: "/images/landing-stats-4.png",
      number: "+12,000",
      text: "اسکن منو",
    },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || section.__counted) return; // StrictMode guard
    section.__counted = true;

    const nums = section.querySelectorAll(".stat-number");

    // prime to 0 and stash target/+ position
    nums.forEach((el) => {
      const original = (el.textContent || "").trim();
      el.dataset.targetText = original;
      const plusStart = /^[+\uFF0B]/.test(original);
      const plusEnd = /[+\uFF0B]$/.test(original);
      el.dataset.plusStart = plusStart ? "1" : "0";
      el.dataset.plusEnd = plusEnd ? "1" : "0";
      el.textContent = plusStart ? "+0" : plusEnd ? "0+" : "0";
    });

    // count once
    nums.forEach((el, i) => {
      const targetText = el.dataset.targetText || "0";
      const plusStart = el.dataset.plusStart === "1";
      const plusEnd = el.dataset.plusEnd === "1";
      const target = parseToNumber(targetText);

      const duration = 5500; // ms
      const delay = i * 80; // small stagger
      const startAt = performance.now() + delay;

      const tick = (now) => {
        if (!el.isConnected) return;
        if (now < startAt) return requestAnimationFrame(tick);

        const t = Math.min(1, (now - startAt) / duration);
        const eased = 1 - Math.pow(1 - t, 2); // easeOutQuad
        const value = Math.round(target * eased);
        const pretty = formatNumber(value);

        el.textContent = plusStart
          ? `+${pretty}`
          : plusEnd
          ? `${pretty}+`
          : pretty;

        if (t < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    });
  }, []);

  // helpers
  function parseToNumber(str) {
    const persian = "۰۱۲۳۴۵۶۷۸۹";
    const arabic = "٠١٢٣٤٥٦٧٨٩";
    let out = "";
    for (const ch of String(str)) {
      const pi = persian.indexOf(ch);
      const ai = arabic.indexOf(ch);
      if (pi > -1) out += String(pi);
      else if (ai > -1) out += String(ai);
      else if (/\d/.test(ch)) out += ch;
    }
    return Number(out || 0);
  }
  function formatNumber(n) {
    return new Intl.NumberFormat("en-US").format(n);
  }

  return (
    <section className="stats-section" ref={sectionRef}>
      <div className="stats-container">
        {stats.map((stat) => (
          <div key={stat.id} className="stat-item">
            <div className="stat-icon">
              <img src={stat.icon} alt={`Stat ${stat.id}`} />
            </div>
            <div className="stat-number">{stat.number}</div>
            <div className="stat-text">{stat.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
