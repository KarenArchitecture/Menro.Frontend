// src/components/landing/InstallPhonesBanner.jsx
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
      const backEl = backRef.current;
      const frontEl = frontRef.current;
      const sectionEl = sectionRef.current;
      if (!backEl || !frontEl || !sectionEl) return;

      const REST = {
        back: { x: -185, y: -179 },
        front: { x: 16, y: -239 },
      };

      const START = {
        backY: REST.back.y + 500,
        frontY: REST.front.y + 520,
      };

      // slower pace => lower speed
      const SPEED = 500; // px/sec
      const backDur = Math.abs(START.backY - REST.back.y) / SPEED;
      const frontDur = Math.abs(START.frontY - REST.front.y) / SPEED;

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "none" }, // flat pace
      });

      tl.to(backEl, {
        y: REST.back.y,
        autoAlpha: 1,
        duration: backDur,
        overwrite: "auto",
      }).to(
        frontEl,
        {
          y: REST.front.y,
          autoAlpha: 1,
          duration: frontDur,
          overwrite: "auto",
        },
        "-=0.2",
      );

      const resetPhones = () => {
        // ✅ don't kill tweens-of (it can kill tl's own child tweens)
        tl.pause(0); // stop + rewind safely

        gsap.set(backEl, {
          x: REST.back.x,
          y: START.backY,
          autoAlpha: 0,
          transformPerspective: 1000,
          z: 0.01,
          willChange: "transform, opacity",
        });

        gsap.set(frontEl, {
          x: REST.front.x,
          y: START.frontY,
          autoAlpha: 0,
          transformPerspective: 1000,
          z: 0.01,
          willChange: "transform, opacity",
        });
      };

      const play = () => {
        resetPhones();
        tl.play(0); // ✅ guaranteed to play
      };

      tl.eventCallback("onComplete", () => {
        gsap.set([backEl, frontEl], { willChange: "auto" });
      });

      // initial state
      resetPhones();

      ScrollTrigger.create({
        id: "installPhones",
        trigger: sectionEl,
        start: "center center",
        // markers: true,
        onEnter: () => {
          console.log("enter");
          play();
        },
        onEnterBack: () => {
          console.log("enterBack");
          play();
        },
        invalidateOnRefresh: true,
      });

      // refresh after images load
      const imgs = sectionEl.querySelectorAll("img");
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
