import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Helper function to wrap text nodes in spans for word-by-word animation
function splitTextToWords(element) {
  if (!element || element.hasAttribute("data-split")) return;

  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false,
  );
  const textNodes = [];
  let node;

  while ((node = walker.nextNode())) {
    if (node.nodeValue.trim() !== "") textNodes.push(node);
  }

  textNodes.forEach((textNode) => {
    // Split by whitespace but keep the whitespace tokens
    const words = textNode.nodeValue.split(/(\s+)/);
    const fragment = document.createDocumentFragment();

    words.forEach((word) => {
      if (word.trim() === "") {
        fragment.appendChild(document.createTextNode(word));
      } else {
        const span = document.createElement("span");
        span.style.display = "inline-block";
        span.className = "animated-word";
        span.textContent = word;
        fragment.appendChild(span);
      }
    });

    textNode.parentNode.replaceChild(fragment, textNode);
  });

  element.setAttribute("data-split", "true");
}

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
  const contentRef = useRef(null); // Ref for desktop content

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isMobile = window.matchMedia("(max-width: 768px)");

    if (reducedMotion.matches || isMobile.matches) return;

    const ctx = gsap.context(() => {
      const backEl = backRef.current;
      const frontEl = frontRef.current;
      const sectionEl = sectionRef.current;
      const contentEl = contentRef.current;

      if (!backEl || !frontEl || !sectionEl) return;

      // Split text into words if content exists
      if (contentEl) {
        splitTextToWords(contentEl);
      }

      const words = contentEl
        ? contentEl.querySelectorAll(".animated-word")
        : [];

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

      // Phones animation
      tl.to(
        backEl,
        {
          y: REST.back.y,
          autoAlpha: 1,
          duration: backDur,
          overwrite: "auto",
        },
        0,
      ) // <--- Starts at 0
        .to(
          frontEl,
          {
            y: REST.front.y,
            autoAlpha: 1,
            duration: frontDur,
            overwrite: "auto",
          },
          "-=0.2",
        );

      // Text word-by-word animation
      if (words.length > 0) {
        tl.fromTo(
          words,
          { autoAlpha: 0, y: 15 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8, // Increased from 0.4
            stagger: 0.08, // Increased from 0.05
            ease: "power2.out",
          },
          0, // <--- Starts at 0 (same time as phones)
        );
      }

      const resetPhones = () => {
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

        if (words.length > 0) {
          gsap.set(words, {
            autoAlpha: 0,
            y: 15,
            willChange: "transform, opacity",
          });
        }
      };

      const play = () => {
        resetPhones();
        tl.play(0);
      };

      tl.eventCallback("onComplete", () => {
        gsap.set([backEl, frontEl, ...words], { willChange: "auto" });
      });

      resetPhones();

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
  }, []);

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
            <div ref={contentRef} className="install-banner__card-content">
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
