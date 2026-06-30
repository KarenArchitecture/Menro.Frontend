import React, { useEffect, useMemo, useRef, useState } from "react";
import MusicTrack from "./MusicTrack";

const normalizeText = (value = "") =>
  value.toString().trim().toLowerCase().replace(/\s+/g, " ");

export default function MusicRequestModal({
  open,
  tracks = [],
  searchQuery = "",
  onClose,
  onRequestTrack,
  remainingRequests = 1,
  limitReachedIconSrc = "/images/music/red-clock-icon.svg",
  infoIconSrc = "/images/music/orange-clock-icon.svg",
  closeIconSrc = "/images/music/close-icon.svg",
}) {
  const [mounted, setMounted] = useState(open);
  const [phase, setPhase] = useState(open ? "open" : "closed");
  const sheetRef = useRef(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setPhase("entering");

      const id = requestAnimationFrame(() => {
        setPhase("open");
        if (sheetRef.current) {
          sheetRef.current.scrollTop = 0;
        }
      });

      return () => cancelAnimationFrame(id);
    }

    if (mounted) {
      setPhase("exiting");
      const timeout = window.setTimeout(() => setMounted(false), 260);
      return () => window.clearTimeout(timeout);
    }
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return;

    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const filteredTracks = useMemo(() => {
    const q = normalizeText(searchQuery);
    if (!q) return tracks;

    return tracks.filter((track) => {
      const haystack = normalizeText(`${track.title} ${track.subtitle}`);
      return haystack.includes(q);
    });
  }, [tracks, searchQuery]);

  if (!mounted) return null;

  return (
    <div className={`music-modal ${phase}`}>
      <button
        type="button"
        className="music-modal__backdrop"
        aria-label="بستن"
        onClick={onClose}
      />

      <section
        ref={sheetRef}
        className={`music-sheet ${phase === "open" ? "is-open" : ""}`}
        aria-label="درخواست موسیقی"
      >
        <div className="music-sheet__header">
          <button
            type="button"
            className="music-modal__close"
            onClick={onClose}
            aria-label="بستن"
          >
            <img src={closeIconSrc} alt="" aria-hidden="true" />
          </button>
        </div>
        <div className="music-sheet__list">
          {filteredTracks.map((track) => (
            <MusicTrack
              key={track.id}
              title={track.title}
              subtitle={track.subtitle}
              image={track.image}
              status={track.status}
              active={track.active}
              showRequestButton
              requestButtonLabel="درخواست"
              requestButtonDisabled={!track.canRequest}
              onRequestClick={() => onRequestTrack?.(track)}
              onActionClick={() => {
                // later
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
