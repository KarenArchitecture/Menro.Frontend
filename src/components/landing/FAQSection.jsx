// components/landing/FAQSection.jsx
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import gsap from "gsap";

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

// getLandingFaqs() returns { id, question, answer, sortOrder }[] where
// answer is a plain string. DEFAULT_FAQ uses an array of paragraphs instead,
// so this normalizes either shape into an array of paragraph strings.
function normalizeAnswer(answer) {
  if (Array.isArray(answer)) return answer;
  if (typeof answer === "string") {
    return answer
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return [];
}

export default function FAQSection({
  items = DEFAULT_FAQ,
  // was previously hardcoded to DEFAULT_FAQ[0]?.id regardless of `items`,
  // so a dynamic first item never opened by default — now derived from
  // whatever `items` is actually passed in.
  initialOpenId = items[0]?.id ?? null,
  allQuestionsHref = "#",
  className = "",
}) {
  const normalizedItems = useMemo(
    () => items.map((it) => ({ ...it, answer: normalizeAnswer(it.answer) })),
    [items],
  );

  const [openId, setOpenId] = useState(initialOpenId);

  const panelsRef = useRef({});
  const setPanelRef = (id) => (el) => {
    panelsRef.current[id] = el;
  };

  const prevOpenRef = useRef(openId ?? null);
  const prefersReduce = useRef(false);
  const isMobile = useRef(false);

  useLayoutEffect(() => {
    prefersReduce.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    isMobile.current = window.matchMedia("(max-width: 768px)").matches;
  }, []);

  useLayoutEffect(() => {
    if (isMobile.current) return;

    const ctx = gsap.context(() => {
      Object.values(panelsRef.current).forEach((p) => {
        if (!p) return;

        gsap.set(p, {
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "1rem",
          overflow: "hidden",
          transformOrigin: "top right",
          height: 0,
          opacity: 0,
          clipPath: "inset(0 0 100% 0 round 14px)",
          pointerEvents: "none",
          willChange: "height, opacity, clip-path, transform",
        });

        const bubbles = p.querySelectorAll(".faq__bubble");
        gsap.set(bubbles, { opacity: 0, y: 8, transformOrigin: "top right" });
      });

      if (initialOpenId && panelsRef.current[initialOpenId]) {
        const p = panelsRef.current[initialOpenId];
        const bubbles = p.querySelectorAll(".faq__bubble");

        gsap.set(p, {
          height: "auto",
          opacity: 1,
          clipPath: "inset(0 0 0% 0 round 14px)",
          pointerEvents: "auto",
        });

        gsap.set(bubbles, { opacity: 1, y: 0 });
      }
    });

    return () => ctx.revert();
  }, [initialOpenId]);

  useEffect(() => {
    if (isMobile.current) {
      prevOpenRef.current = openId ?? null;
      return;
    }

    const newId = openId;
    const oldId = prevOpenRef.current;
    if (newId === oldId) return;

    const closePanel = (id) => {
      if (!id) return;

      const p = panelsRef.current[id];
      if (!p) return;

      const bubbles = p.querySelectorAll(".faq__bubble");
      gsap.killTweensOf([p, bubbles]);

      if (prefersReduce.current) {
        gsap.set(bubbles, { opacity: 1, y: 0 });
        gsap.set(p, {
          height: 0,
          opacity: 0,
          clipPath: "inset(0 0 100% 0 round 14px)",
          pointerEvents: "none",
        });
        return;
      }

      gsap.to(bubbles, {
        opacity: 0,
        y: 6,
        duration: 0.22,
        ease: "power1.in",
        stagger: -0.04,
      });

      gsap.to(p, {
        height: 0,
        opacity: 0,
        clipPath: "inset(0 0 100% 0 round 14px)",
        duration: 0.5,
        ease: "sine.inOut",
        delay: 0.02,
        onStart: () => gsap.set(p, { pointerEvents: "none" }),
      });
    };

    const openPanel = (id) => {
      if (!id) return;

      const p = panelsRef.current[id];
      if (!p) return;

      const bubbles = p.querySelectorAll(".faq__bubble");
      gsap.killTweensOf([p, bubbles]);

      if (prefersReduce.current) {
        gsap.set(p, {
          height: "auto",
          opacity: 1,
          clipPath: "inset(0 0 0% 0 round 14px)",
          pointerEvents: "auto",
        });
        gsap.set(bubbles, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(bubbles, { opacity: 0, y: 8, transformOrigin: "top right" });
      gsap.set(p, { pointerEvents: "auto" });

      const natural = p.scrollHeight;

      gsap.fromTo(
        p,
        { height: 0, opacity: 0, clipPath: "inset(0 0 100% 0 round 14px)" },
        {
          height: natural,
          opacity: 1,
          clipPath: "inset(0 0 0% 0 round 14px)",
          duration: 0.65,
          ease: "power3.out",
          onComplete: () => gsap.set(p, { height: "auto" }),
        },
      );

      gsap.to(bubbles, {
        opacity: 1,
        y: 0,
        duration: 0.34,
        ease: "power2.out",
        stagger: 0.06,
        delay: 0.04,
      });
    };

    if (oldId && oldId !== newId) closePanel(oldId);
    if (newId) openPanel(newId);

    prevOpenRef.current = newId ?? null;
  }, [openId]);

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
        {normalizedItems.map((it) => {
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
                <span className="faq__icon" aria-hidden="true" />
                <span className="faq__question">{it.question}</span>
              </button>

              <div
                id={panelId}
                ref={setPanelRef(it.id)}
                role="region"
                aria-labelledby={buttonId}
                aria-hidden={!isOpen}
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

        <div className="faq__all">
          <a href={allQuestionsHref} className="faq__all-link">
            <span>مشاهده همه سوالات</span>
            <span className="faq__all-arrow" aria-hidden="true">
              ↖
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
