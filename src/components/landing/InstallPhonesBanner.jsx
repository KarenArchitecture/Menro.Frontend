// src/components/landing/InstallPhonesBanner.jsx
import React, { useRef, useLayoutEffect, useEffect, useState } from "react";
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

  // The element that actually scrolls (window or .app-shell__content)
  const [scroller, setScroller] = useState(null);

  useEffect(() => {
    const detectScroller = () => {
      let activeScroller = window;
      const customContainer = document.querySelector(".app-shell__content");

      if (customContainer) {
        const styles = window.getComputedStyle(customContainer);
        if (styles.overflowY === "auto" || styles.overflowY === "scroll") {
          activeScroller = customContainer;
        }
      }
      setScroller(activeScroller);
    };

    detectScroller();
    window.addEventListener("resize", detectScroller);

    return () => window.removeEventListener("resize", detectScroller);
  }, []);

  useLayoutEffect(() => {
    if (!sectionRef.current || !scroller) return;

    /**
     * Two separate ScrollTriggers, because "when to play" and "when to reset"
     * are different moments:
     *
     *  PLAY  : fires when the section reaches `playStart` (e.g. top at 25% of
     *          the viewport). It never resets anything.
     *
     *  RESET : covers the whole time any part of the section is on screen
     *          ("top bottom" -> "bottom top"). It only resets when the
     *          section has left the viewport completely, in either direction.
     *
     * The `played` flag stops the timeline from restarting while the user
     * scrolls around inside the section (or back and forth over the play line).
     */
    const bindPlayAndReset = (tl, sectionEl, { id, playStart }) => {
      let played = false;

      const play = () => {
        if (played) return;
        played = true;
        tl.play(0);
      };

      const reset = () => {
        played = false;
        tl.pause(0);
      };

      ScrollTrigger.create({
        id: `${id}Play`,
        trigger: sectionEl,
        scroller,
        start: playStart,
        end: "bottom top",
        onEnter: play,
        onEnterBack: play,
        invalidateOnRefresh: true,
      });

      ScrollTrigger.create({
        id: `${id}Reset`,
        trigger: sectionEl,
        scroller,
        start: "top bottom", // first pixel of the section enters the viewport
        end: "bottom top", // last pixel of the section leaves the viewport
        onLeave: reset,
        onLeaveBack: reset,
        invalidateOnRefresh: true,
      });
    };

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

        // Word splitting logic
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

        gsap.set([backEl, frontEl], { transformPerspective: 1000, z: 0.01 });

        tl.fromTo(
          words,
          { autoAlpha: 0, y: 20, willChange: "opacity, transform" },
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "back.out(1.2)",
            overwrite: "auto",
            willChange: "auto",
          },
          0,
        );

        tl.fromTo(
          backEl,
          {
            x: REST.back.x,
            y: START.backY,
            autoAlpha: 0,
            willChange: "transform, opacity",
          },
          {
            y: REST.back.y,
            autoAlpha: 1,
            duration: phoneDur,
            ease: "power3.out",
            overwrite: "auto",
            willChange: "auto",
          },
          0,
        );

        tl.fromTo(
          frontEl,
          {
            x: REST.front.x,
            y: START.frontY,
            autoAlpha: 0,
            willChange: "transform, opacity",
          },
          {
            y: REST.front.y,
            autoAlpha: 1,
            duration: phoneDur,
            ease: "power3.out",
            overwrite: "auto",
            willChange: "auto",
          },
          0.1,
        );

        // Force elements to their start states immediately
        tl.pause(0);

        bindPlayAndReset(tl, sectionEl, {
          id: "installPhonesDesktop",
          playStart: "top 25%",
        });
      });

      // --- MOBILE ANIMATION (<= 768px) ---
      mm.add("(max-width: 768px)", () => {
        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        );
        if (reducedMotion.matches) return;

        const backEl = backRef.current;
        const frontEl = frontRef.current;
        const sectionEl = sectionRef.current;

        if (!backEl || !frontEl || !sectionEl) return;

        const REST = { back: { x: -4, y: -8 }, front: { x: -3, y: -19 } };
        const START = { backY: REST.back.y + 500, frontY: REST.front.y + 520 };
        const phoneDur = 2;

        const tl = gsap.timeline({ paused: true });

        gsap.set([backEl, frontEl], { transformPerspective: 1000, z: 0.01 });

        tl.fromTo(
          backEl,
          {
            x: REST.back.x,
            y: START.backY,
            autoAlpha: 0,
            willChange: "transform, opacity",
          },
          {
            y: REST.back.y,
            autoAlpha: 1,
            duration: phoneDur,
            ease: "power3.out",
            overwrite: "auto",
            willChange: "auto",
          },
          0,
        );

        tl.fromTo(
          frontEl,
          {
            x: REST.front.x,
            y: START.frontY,
            autoAlpha: 0,
            willChange: "transform, opacity",
          },
          {
            y: REST.front.y,
            autoAlpha: 1,
            duration: phoneDur,
            ease: "power3.out",
            overwrite: "auto",
            willChange: "auto",
          },
          0.1,
        );

        // Force elements to their start states immediately
        tl.pause(0);

        bindPlayAndReset(tl, sectionEl, {
          id: "installPhonesMobile",
          playStart: "top 65%",
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
  }, [children, scroller]);

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