import React from "react";

export default function MusicTrack({
  title,
  subtitle = "عرفان طهماسبی",
  image,
  status = null, // null | "requested" | "mineRequested"
  active = false,
  onSelect,
  onActionClick,

  showRequestButton = false,
  requestButtonLabel = "درخواست",
  requestButtonDisabled = false,
  onRequestClick,
}) {
  const statusText =
    status === "requested"
      ? "درخواستی"
      : status === "mineRequested"
        ? "درخواستی شما"
        : null;

  const handleSelect = () => {
    if (onSelect) onSelect();
  };

  const handleActionClick = (e) => {
    e.stopPropagation();
    if (onActionClick) onActionClick();
  };

  const handleRequestClick = (e) => {
    e.stopPropagation();
    if (!requestButtonDisabled && onRequestClick) onRequestClick();
  };

  return (
    <div
      className={`music-track ${active ? "is-active" : ""}`}
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleSelect();
      }}
    >
      {showRequestButton && (
        <button
          type="button"
          className={`music-track__request ${
            requestButtonDisabled ? "is-disabled" : ""
          }`}
          onClick={handleRequestClick}
          disabled={requestButtonDisabled}
        >
          {requestButtonLabel}
        </button>
      )}

      <button
        type="button"
        className="music-track__action"
        aria-label="کپی"
        onClick={handleActionClick}
      >
        <img
          src="/images/music/copy-music-icon.svg"
          alt=""
          aria-hidden="true"
          className="music-track__action-icon"
        />
      </button>

      <div className="music-track__content">
        <div className="music-track__title-col">
          <h3
            className="music-track__title"
            style={{
              color: active ? "#ff9800" : "inherit",
              fontWeight: active ? "bold" : "normal",
            }}
          >
            {title}
          </h3>{" "}
          <p className="music-track__subtitle">{subtitle}</p>
        </div>

        {statusText && (
          <span
            className={`music-track__status ${
              status === "mineRequested"
                ? "music-track__status--mine"
                : "music-track__status--requested"
            }`}
          >
            {statusText}
          </span>
        )}
      </div>

      <div className="music-track__thumb">
        <img src={image} alt={title} className="music-track__img" />

        {active && <div className="music-track__thumb-overlay" />}

        {active && (
          <span className="music-track__play" aria-hidden="true">
            <img
              src="/images/music/play-music-icon.svg"
              alt=""
              className="music-track__play-icon"
            />
          </span>
        )}
      </div>
    </div>
  );
}
