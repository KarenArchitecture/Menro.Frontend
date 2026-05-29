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
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // --- DESKTOP ANIMATION (>= 769px) ---
      mm.add("(min-width: 769px)", () => {
        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        );
        if (reducedMotion.matches) return;

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
        const REST = { back: { x: -185, y: -179 }, front: { x: 16, y: -239 } };
        const START = { backY: REST.back.y + 500, frontY: REST.front.y + 520 };
        const phoneDur = 2;
        const tl = gsap.timeline({ paused: true });

        tl.to(
          words,
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "back.out(1.2)",
            overwrite: "auto",
          },
          0,
        );
        tl.to(
          backEl,
          {
            y: REST.back.y,
            autoAlpha: 1,
            duration: phoneDur,
            ease: "power3.out",
            overwrite: "auto",
          },
          0,
        ).to(
          frontEl,
          {
            y: REST.front.y,
            autoAlpha: 1,
            duration: phoneDur,
            ease: "power3.out",
            overwrite: "auto",
          },
          0.1,
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
          if (words.length)
            gsap.set(words, {
              autoAlpha: 0,
              y: 20,
              willChange: "opacity, transform",
            });
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
          id: "installPhonesDesktop",
          trigger: sectionEl,
          start: "center center",
          onEnter: play,
          onEnterBack: play,
          invalidateOnRefresh: true,
        });
      });

      // --- MOBILE ANIMATION (<= 768px) ---
      mm.add("(max-width: 768px)", () => {
        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        );
        if (reducedMotion.matches) return;

        // THE FIX: Intelligently determine the scroller
        let activeScroller = window;
        const customContainer = document.querySelector(".app-shell__content");

        if (customContainer) {
          // Check if the CSS has actually turned this into a scrollable container
          const styles = window.getComputedStyle(customContainer);
          if (styles.overflowY === "auto" || styles.overflowY === "scroll") {
            activeScroller = customContainer;
          }
        }

        const backEl = backRef.current;
        const frontEl = frontRef.current;
        const sectionEl = sectionRef.current;

        if (!backEl || !frontEl || !sectionEl) return;

        const REST = { back: { x: -185, y: -179 }, front: { x: 16, y: -239 } };
        const START = { backY: REST.back.y + 500, frontY: REST.front.y + 520 };
        const phoneDur = 2;
        const tl = gsap.timeline({ paused: true });

        tl.to(
          backEl,
          {
            y: REST.back.y,
            autoAlpha: 1,
            duration: phoneDur,
            ease: "power3.out",
            overwrite: "auto",
          },
          0,
        ).to(
          frontEl,
          {
            y: REST.front.y,
            autoAlpha: 1,
            duration: phoneDur,
            ease: "power3.out",
            overwrite: "auto",
          },
          0.1,
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
        };

        const play = () => {
          resetAnimations();
          tl.play(0);
        };

        tl.eventCallback("onComplete", () => {
          gsap.set([backEl, frontEl], { willChange: "auto" });
        });

        resetAnimations();

        ScrollTrigger.create({
          id: "installPhonesMobile",
          trigger: sectionEl,
          scroller: activeScroller, // Uses the intelligently detected scroller
          start: "top 75%", // Triggers slightly earlier on mobile
          onEnter: play,
          onEnterBack: play,
          invalidateOnRefresh: true,
        });
      });
    }, sectionRef);

    const imgs = sectionRef.current.querySelectorAll("img");
    const onLoad = () => ScrollTrigger.refresh();
    imgs.forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", onLoad, { once: true });
      }
    });

    return () => {
      ctx.revert();
      imgs.forEach((img) => img.removeEventListener("load", onLoad));
    };
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
