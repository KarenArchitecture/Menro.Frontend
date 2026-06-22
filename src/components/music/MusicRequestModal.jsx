import React, { useEffect, useMemo, useRef, useState } from "react";
import MusicTrack from "./MusicTrack";

const normalizeText = (value = "") =>
  value.toString().trim().toLowerCase().replace(/\s+/g, " ");

export default function MusicRequestModal({
  open,
  tracks = [],
  searchQuery = "",
  onSearchChange,
  onClose,
  onRequestTrack,
  selectedTrackId = null,
  remainingRequests = 1,
  limitReachedIconSrc = "/images/music/limit-alert-icon.svg",
  infoIconSrc = "/images/music/info-alert-icon.svg",
  closeIconSrc = "/images/music/close-icon.svg",
}) {
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (open) setExpanded(false);
  }, [open]);

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

  const hasSelection = Boolean(selectedTrackId);

  const filteredTracks = useMemo(() => {
    const q = normalizeText(searchQuery);
    if (!q) return tracks;

    return tracks.filter((track) => {
      const haystack = normalizeText(`${track.title} ${track.subtitle}`);
      return haystack.includes(q);
    });
  }, [tracks, searchQuery]);

  const handleWheel = (e) => {
    const list = listRef.current;
    if (!list) return;

    const atTop = list.scrollTop <= 0;
    const atBottom =
      list.scrollTop + list.clientHeight >= list.scrollHeight - 1;

    // scroll up -> expand
    if (!expanded && e.deltaY < 0) {
      setExpanded(true);
      return;
    }

    // scroll down while expanded and list reaches an edge -> collapse
    if (expanded && e.deltaY > 0 && (atTop || atBottom)) {
      setExpanded(false);
    }
  };

  if (!open) return null;

  return (
    <div className="music-modal">
      <button
        type="button"
        className="music-modal__backdrop"
        aria-label="بستن"
        onClick={onClose}
      />

      <div
        className={`music-modal__alerts ${expanded ? "is-expanded" : "is-collapsed"}`}
        aria-hidden="true"
      >
        {hasSelection ? (
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
        )}

        {expanded && (
          <button
            type="button"
            className="music-modal__close"
            onClick={onClose}
            aria-label="بستن"
          >
            <img src={closeIconSrc} alt="" aria-hidden="true" />
          </button>
        )}
      </div>

      <section
        className={`music-sheet ${expanded ? "is-expanded" : ""}`}
        onWheel={handleWheel}
      >
        <div className="music-sheet__handle">
          <span className="music-sheet__grabber" />
        </div>

        <div
          ref={listRef}
          className="music-sheet__list"
          aria-label="لیست درخواست موسیقی"
        >
          {filteredTracks.map((track) => (
            <MusicTrack
              key={track.id}
              title={track.title}
              subtitle={track.subtitle}
              image={track.image}
              status={track.status}
              active={selectedTrackId === track.id || track.active}
              showRequestButton
              requestButtonLabel="درخواست"
              requestButtonDisabled={hasSelection}
              onRequestClick={() => onRequestTrack?.(track)}
              onActionClick={() => {
                // later: copy / backend action
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
