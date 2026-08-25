// src/components/musicPlayer/PreviewModal.jsx
import React from "react";
import { formatTime } from "../../utils/musicFormatters";

/**
 * مودال پیش‌نمایش آهنگ. کاملاً controlled — چون از دکمه‌ی پخش داخل
 * MusicArchiveCard (کامپوننت خواهر) باز می‌شود.
 */
export default function PreviewModal({
  isOpen,
  trackTitle,
  isPlaying,
  currentTime,
  duration,
  progressPct,
  onTogglePlay,
  onSeekMouseDown,
  onSeekChange,
  onSeekMouseUp,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="mh-modal-backdrop">
      <div className="mh-modal mh-modal--wide">
        <h4 className="mh-modal__title">
          پیش‌نمایش آهنگ
          <button className="mh-icon-btn" onClick={onClose} title="بستن">
            ✕
          </button>
        </h4>

        <div className="mh-preview-track">{trackTitle}</div>

        <div className="mh-preview-progress">
          <div
            className="mh-preview-progress-fill"
            style={{ width: `${progressPct}%` }}
          />
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onMouseDown={onSeekMouseDown}
            onChange={onSeekChange}
            onMouseUp={onSeekMouseUp}
            onTouchStart={onSeekMouseDown}
            onTouchEnd={onSeekMouseUp}
          />
        </div>

        <div className="mh-preview-time">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="mh-preview-playbtn">
          <button
            type="button"
            className="player-btn player-btn--main"
            onClick={onTogglePlay}
          >
            <i className={isPlaying ? "fas fa-pause" : "fas fa-play"} />
          </button>
        </div>
      </div>
    </div>
  );
}
