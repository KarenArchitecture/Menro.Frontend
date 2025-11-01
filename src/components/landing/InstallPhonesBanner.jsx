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
      // Final positions (unchanged)
      const REST = {
        back: { x: -185, y: -179 },
        front: { x: 16, y: -239 },
      };

      // Start positions (below final)
      const START = {
        backY: REST.back.y + 500,
        frontY: REST.front.y + 520,
      };

      // Constant velocity (px/sec)
      const SPEED = 400;
      const backDur = Math.abs(START.backY - REST.back.y) / SPEED;
      const frontDur = Math.abs(START.frontY - REST.front.y) / SPEED;

      // Pin to final x/y first; animate only 'y' to avoid end-pop
      gsap.set(backRef.current, {
        x: REST.back.x,
        y: REST.back.y,
        autoAlpha: 0,
        transformPerspective: 1000,
        z: 0.01,
        willChange: "transform, opacity",
      });
      gsap.set(frontRef.current, {
        x: REST.front.x,
        y: REST.front.y,
        autoAlpha: 0,
        transformPerspective: 1000,
        z: 0.01,
        willChange: "transform, opacity",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
          once: true,
        },
      });

      // Back phone — linear, uniform speed, animate only 'y'
      tl.fromTo(
        backRef.current,
        { y: START.backY, autoAlpha: 0, immediateRender: false },
        {
          y: REST.back.y,
          autoAlpha: 1,
          duration: backDur,
          ease: "none",
          overwrite: "auto",
        }
      )
        // Front phone — overlap slightly
        .fromTo(
          frontRef.current,
          { y: START.frontY, autoAlpha: 0, immediateRender: false },
          {
            y: REST.front.y,
            autoAlpha: 1,
            duration: frontDur,
            ease: "none",
            overwrite: "auto",
          },
          "-=0.20"
        )
        // Optional: release heavy hints after animation
        .add(() =>
          gsap.set([backRef.current, frontRef.current], { willChange: "auto" })
        );

      // Keep trigger correct after images load
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
