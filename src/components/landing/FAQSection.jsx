// components/landing/FAQSection.jsx
import React, { useState } from "react";

/**
 * Headless, accessible FAQ (single-open).
 * CSS will style: +/− icon, dividers, glass bubbles, RTL alignment.
 */
const DEFAULT_FAQ = [
  {
    id: "q1",
    question: "سوال اول با متن طولانی؟",
    answer: [
      "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه لورم ایپسوم متن ساختگی لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه لورم ایپسوم متن ساختگی",
      "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، بلکه روزنامه و مجله در ستون و سطر آنچنان که لازم است.",
    ],
  },
  {
    id: "q2",
    question: "سوال دوم با متن بسیار طولانی؟",
    answer: [
      "این یک پاسخ نمونه است که می‌تواند چند خط باشد و داخل باکس‌های شیشه‌ای نمایش داده شود.",
    ],
  },
  { id: "q3", question: "سوال سوم", answer: ["پاسخ کوتاه برای سوال سوم."] },
  { id: "q4", question: "سوال چهارم", answer: ["یک متن نمونه دیگر…"] },
  { id: "q5", question: "سوال پنجم", answer: ["پاسخ به سوال پنجم."] },
];

export default function FAQSection({
  items = DEFAULT_FAQ,
  initialOpenId = items[0]?.id ?? null,
  className = "",
}) {
  const [openId, setOpenId] = useState(initialOpenId);

  const onToggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section
      className={`faq ${className}`}
      aria-labelledby="faq-title"
      dir="rtl"
    >
      <h2 id="faq-title" className="sr-only">
        سوالات متداول
      </h2>

      <div className="faq__list">
        {items.map((it) => {
          const isOpen = openId === it.id;
          const panelId = `faq-panel-${it.id}`;
          const buttonId = `faq-button-${it.id}`;

          return (
            <div key={it.id} className="faq__item">
              <button
                id={buttonId}
                type="button"
                className="faq__trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => onToggle(it.id)}
              >
                {/* Icon (CSS will render + / − via ::before/::after) */}
                <span className="faq__icon" aria-hidden="true" />
                <span className="faq__question">{it.question}</span>
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={`faq__content${isOpen ? " is-open" : ""}`}
              >
                {it.answer.map((para, idx) => (
                  <div key={idx} className="faq__bubble">
                    <p className="faq__answer">{para}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
