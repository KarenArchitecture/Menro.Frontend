// src/hooks/useHeroPointer.js
import { useEffect, useRef } from "react";

/**
 * Tracks the pointer over an element and shares it through a ref, so several
 * effects (particles, floating images) can read it without re-rendering.
 *
 * The ref holds: { clientX, clientY, inside }
 * It stores SCREEN coordinates on purpose: when the page scrolls under a
 * still mouse, consumers convert to hero coordinates each frame, so the
 * pointer stays where it really is.
 */
export default function useHeroPointer(sectionRef) {
  const pointer = useRef({ clientX: -9999, clientY: -9999, inside: false });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onMove = (e) => {
      const p = pointer.current;
      p.clientX = e.clientX;
      p.clientY = e.clientY;
      p.inside = true;
    };

    const onLeave = () => {
      pointer.current.inside = false;
    };

    // A lifted finger is "gone"; a mouse button release is not.
    const onUp = (e) => {
      if (e.pointerType !== "mouse") pointer.current.inside = false;
    };

    section.addEventListener("pointermove", onMove, { passive: true });
    section.addEventListener("pointerdown", onMove, { passive: true });
    section.addEventListener("pointerleave", onLeave);
    section.addEventListener("pointercancel", onLeave);
    section.addEventListener("pointerup", onUp);

    return () => {
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerdown", onMove);
      section.removeEventListener("pointerleave", onLeave);
      section.removeEventListener("pointercancel", onLeave);
      section.removeEventListener("pointerup", onUp);
    };
  }, [sectionRef]);

  return pointer;
}