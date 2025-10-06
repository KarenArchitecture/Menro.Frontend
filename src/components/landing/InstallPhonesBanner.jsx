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
      // Keep phones hidden/off-screen until we play the animation
      gsap.set([backRef.current, frontRef.current], {
        autoAlpha: 0,
        y: -500,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%", // fire when section top hits 80% viewport
          toggleActions: "play none none none", // one-shot
          once: true, // don’t re-trigger on scroll back
          // markers: true,                 // <- uncomment to debug
        },
        defaults: { ease: "power3.inout" },
      });

      // Fade/slide to final positions
      tl.to(backRef.current, {
        autoAlpha: 1,
        x: -185,
        y: -179,
        duration: 1.2, // edit to change speed
      }).to(
        frontRef.current,
        {
          autoAlpha: 1,
          x: 59,
          y: -295,
          duration: 1.2, // edit to change speed
        },
        "-=0.25"
      );

      // Refresh after images load to ensure correct trigger position
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
