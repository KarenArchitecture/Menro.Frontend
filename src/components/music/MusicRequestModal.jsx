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
  selectedTrackId = null,
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

  // const hasSelection = Boolean(selectedTrackId);

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
          {/* {hasSelection ? (
            <div className="music-sheet__alert music-sheet__alert--danger">
              <img
                src={limitReachedIconSrc}
                alt=""
                aria-hidden="true"
                className="music-sheet__alert-icon"
              />
              <span>
                تعداد درخواست های موسیقی امروز شما از این رستوران تمام شده
              </span>
            </div>
          ) : (
            <div className="music-sheet__alert music-sheet__alert--info">
              <img
                src={infoIconSrc}
                alt=""
                aria-hidden="true"
                className="music-sheet__alert-icon"
              />
              <span>
                شما در روز قادر به درخواست{" "}
                <span className="music-sheet__limit-number">
                  {remainingRequests}
                </span>{" "}
                موسیقی از این رستوران هستید.
              </span>
            </div>
          )} */}

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
          {filteredTracks.map((track) => {
            const modalStatus =
              selectedTrackId === track.id ? "mineRequested" : null;

            return (
              <MusicTrack
                key={track.id}
                title={track.title}
                subtitle={track.subtitle}
                image={track.image}
                status={modalStatus}
                active={selectedTrackId === track.id || track.active}
                showRequestButton
                requestButtonLabel="درخواست"
                // requestButtonDisabled={hasSelection}
                requestButtonDisabled={false}
                onRequestClick={() => onRequestTrack?.(track)}
                onActionClick={() => {
                  // later: copy / backend action
                }}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
