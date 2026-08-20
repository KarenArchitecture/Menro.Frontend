// src/components/musicPlayer/NowPlayingBar.jsx
import React from "react";
import { formatTime } from "../../utils/musicFormatters";

/**
 * نوار «در حال پخش» بالای صفحه — کاملاً presentational.
 * تمام state و منطق پخش از MusicSection تزریق می‌شود، چون
 * isPlaying و playingPlaylistTrackId هم‌زمان در کارت آرشیو و
 * پلی‌لیست برای هایلایت‌کردن آهنگ فعلی استفاده می‌شوند.
 */
export default function NowPlayingBar({
  nowPlayingTrack,
  isPlaying,
  currentTime,
  duration,
  mainProgressPct,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeekMouseDown,
  onSeekChange,
  onSeekMouseUp,
}) {
  return (
    <div className="player-bar">
      <div className="player-bar__art-wrap">
        <div className={`player-bar__art ${isPlaying ? "is-spinning" : ""}`}>
          {nowPlayingTrack?.artworkUrl ? (
            <img src={nowPlayingTrack.artworkUrl} alt="" />
          ) : (
            <span className="player-bar__art-hole" />
          )}
        </div>
      </div>

      <div className="player-bar__controls">
        <button
          className="player-btn player-btn--ghost"
          title="قبلی"
          onClick={onPrevious}
        >
          <i className="fas fa-step-backward" />
        </button>

        <button
          type="button"
          className="player-btn player-btn--main"
          onClick={onTogglePlay}
        >
          <i className={isPlaying ? "fas fa-pause" : "fas fa-play"} />
        </button>

        <button
          className="player-btn player-btn--ghost"
          title="بعدی"
          onClick={onNext}
        >
          <i className="fas fa-step-forward" />
        </button>
      </div>

      <div className="player-bar__meta">
        <div className="player-bar__track-row">
          <span
            className={`player-bar__title ${nowPlayingTrack ? "" : "is-idle"}`}
          >
            {nowPlayingTrack?.title || "آهنگی در حال پخش نیست"}
          </span>
          <span className="player-bar__time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="player-bar__progress">
          <div
            className="player-bar__progress-fill"
            style={{ width: `${mainProgressPct}%` }}
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
      </div>
    </div>
  );
}
