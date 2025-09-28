import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export default function InstallPhonesBanner({
  bgSrc = "/images/app/mesh-card.png",
  phoneFrontSrc = "/images/app/phone-front.png",
  phoneBackSrc = "/images/app/phone-back.png",
  altFront = "نمایش اپلیکیشن منرو روی گوشی",
  altBack = "",
  children,
}) {
  const sectionRef = useRef(null);
  const backRef = useRef(null);
  const frontRef = useRef(null);

  useLayoutEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "center center",
          scrub: 1.5,
          invalidateOnRefresh: true,
        },
        defaults: { ease: "power3.out" },
      });

      // Fade-in from ABOVE

      tl.fromTo(
        backRef.current,
        { autoAlpha: 0, y: -500, immediateRender: false },
        { autoAlpha: 1, x: -185, y: -179, duration: 3 }
      ).fromTo(
        frontRef.current,
        { autoAlpha: 0, y: -500, immediateRender: false },
        { autoAlpha: 1, x: 59, y: -295, duration: 3 },
        "-=0.35"
      );

      // Ensure ScrollTrigger sizes are right after images load
      const imgs = sectionRef.current.querySelectorAll("img");
      const onLoad = () => ScrollTrigger.refresh();
      imgs.forEach((img) => {
        if (!img.complete) img.addEventListener("load", onLoad, { once: true });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="install-banner"
      aria-label="بخش نصب اپلیکیشن"
    >
      <div className="install-banner__card">
        <img
          className="install-banner__card-img"
          src={bgSrc}
          alt=""
          loading="lazy"
          decoding="async"
        />
        {children && (
          <div className="install-banner__card-content">{children}</div>
        )}
      </div>

      <div className="install-banner__phones" aria-hidden="true">
        <img
          ref={backRef}
          className="install-banner__phone install-banner__phone--back"
          src={phoneBackSrc}
          alt={altBack}
          loading="lazy"
          decoding="async"
        />
        <img
          ref={frontRef}
          className="install-banner__phone install-banner__phone--front"
          src={phoneFrontSrc}
          alt={altFront}
          decoding="async"
        />
      </div>
    </section>
  );
}
