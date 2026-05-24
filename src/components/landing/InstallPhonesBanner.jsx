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
  const desktopContentRef = useRef(null);

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isMobile = window.matchMedia("(max-width: 768px)");

    if (reducedMotion.matches || isMobile.matches) return;

    const ctx = gsap.context(() => {
      const backEl = backRef.current;
      const frontEl = frontRef.current;
      const sectionEl = sectionRef.current;
      const desktopContentEl = desktopContentRef.current;

      if (!backEl || !frontEl || !sectionEl || !desktopContentEl) return;

      const splitTextToWords = (element) => {
        if (element.dataset.splitted)
          return Array.from(element.querySelectorAll(".gsap-word"));

        const walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT,
          null,
          false,
        );
        let textNodes = [];
        let node;
        while ((node = walker.nextNode())) {
          if (node.nodeValue.trim() !== "") textNodes.push(node);
        }

        textNodes.forEach((textNode) => {
          const fragment = document.createDocumentFragment();
          const words = textNode.nodeValue.split(/(\s+)/);
          words.forEach((word) => {
            if (word.trim() === "") {
              fragment.appendChild(document.createTextNode(word));
            } else {
              const span = document.createElement("span");
              span.textContent = word;
              span.className = "gsap-word";
              // Inline-block is critical for the Y-axis transform to work
              span.style.display = "inline-block";
              fragment.appendChild(span);
            }
          });
          textNode.parentNode.replaceChild(fragment, textNode);
        });

        element.dataset.splitted = "true";
        return Array.from(element.querySelectorAll(".gsap-word"));
      };

      const words = splitTextToWords(desktopContentEl);

      const REST = {
        back: { x: -185, y: -179 },
        front: { x: 16, y: -239 },
      };

      const START = {
        backY: REST.back.y + 500,
        frontY: REST.front.y + 520,
      };

      const SPEED = 500;
      const backDur = Math.abs(START.backY - REST.back.y) / SPEED;
      const frontDur = Math.abs(START.frontY - REST.front.y) / SPEED;

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "none" },
      });

      // 1. Updated Words Animation
      tl.to(
        words,
        {
          autoAlpha: 1, // Fades in
          y: 0, // Moves to its original position
          stagger: 0.1, // Increased delay between words for a clearer sequence
          duration: 0.8, // Increased duration for a softer, slower movement
          ease: "back.out(1.2)", // Gives a very slight, elegant bounce/overshoot
          overwrite: "auto",
        },
        0,
      ); // Still starts with the phones

      // 2. Phone Animations
      tl.to(
        backEl,
        {
          y: REST.back.y,
          autoAlpha: 1,
          duration: backDur,
          overwrite: "auto",
        },
        0,
      ).to(
        frontEl,
        {
          y: REST.front.y,
          autoAlpha: 1,
          duration: frontDur,
          overwrite: "auto",
        },
        "-=0.2",
      );

      const resetAnimations = () => {
        tl.pause(0);

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

        // Updated Reset Words: Start invisible AND 20px lower
        if (words.length) {
          gsap.set(words, {
            autoAlpha: 0,
            y: 20, // Start 20px down so it can move up to 0
            willChange: "opacity, transform",
          });
        }
      };

      const play = () => {
        resetAnimations();
        tl.play(0);
      };

      tl.eventCallback("onComplete", () => {
        gsap.set([backEl, frontEl, ...words], { willChange: "auto" });
      });

      resetAnimations();

      ScrollTrigger.create({
        id: "installPhones",
        trigger: sectionEl,
        start: "center center",
        onEnter: play,
        onEnterBack: play,
        invalidateOnRefresh: true,
      });

      const imgs = sectionEl.querySelectorAll("img");
      const onLoad = () => ScrollTrigger.refresh();

      imgs.forEach((img) => {
        if (!img.complete) {
          img.addEventListener("load", onLoad, { once: true });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [children]);

  return (
    <section
      ref={sectionRef}
      className="install-banner"
      aria-label="بخش نصب اپلیکیشن"
    >
      <div className="install-banner__visual">
        <div className="install-banner__card">
          <img
            className="install-banner__card-img"
            src={bgSrc}
            alt=""
            loading="lazy"
            decoding="async"
          />
          {children && (
            <div
              ref={desktopContentRef}
              className="install-banner__card-content"
            >
              {children}
            </div>
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
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      {children && (
        <div className="install-banner__mobile-content">{children}</div>
      )}
    </section>
  );
}
