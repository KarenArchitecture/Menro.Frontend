// src/components/musicPlayer/TrackRequestsCard.jsx
import React from "react";

/**
 * کارت «آهنگ‌های درخواستی» — کاملاً presentational، بدون state داخلی.
 * تمام داده و رفتار از طریق props از MusicSection تزریق می‌شود.
 *
 * @param {Array} requestedTracks - لیست آهنگ‌های درخواستی
 * @param {boolean} loadingRequests - وضعیت لودینگ دکمه‌ی بروزرسانی
 * @param {(track: object) => void} onApprove - تایید یک درخواست
 * @param {(trackId: string|number) => void} onReject - رد یک درخواست
 * @param {() => void} onRefresh - بروزرسانی لیست درخواست‌ها
 */
export default function TrackRequestsCard({
  requestedTracks,
  loadingRequests,
  onApprove,
  onReject,
  onRefresh,
}) {
  return (
    <div className="music-card requests-card">
      <div className="music-card__header">
        <h3 className="music-card__title">
          <span className="icon-badge">
            <i className="fas fa-headphones-alt" />
          </span>
          آهنگ‌های درخواستی
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="pill-count">{requestedTracks.length} درخواست</span>

          <button
            type="button"
            className="mh-btn mh-btn--ghost"
            onClick={onRefresh}
            disabled={loadingRequests}
            title="بروزرسانی"
          >
            <i
              className={`fas fa-sync-alt ${
                loadingRequests ? "spin-icon" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {requestedTracks.length === 0 ? (
        <div className="mh-empty">هیچ آهنگ درخواستی جدیدی وجود ندارد</div>
      ) : (
        <div className="requests-grid">
          {requestedTracks.map((track) => (
            <div key={track.id} className="request-card">
              <div className="request-card__art">
                <i className="fas fa-music" />
              </div>
              <div className="request-card__info">
                <span className="request-card__title">
                  {track.title || "نامشخص"}
                </span>
                <span className="request-card__artist">
                  {track.artist || "هنرمند نامشخص"}
                </span>
              </div>
              <div className="request-card__actions">
                <button
                  type="button"
                  className="mh-btn mh-btn--approve"
                  onClick={() => onApprove(track)}
                >
                  <i className="fas fa-check" /> تایید
                </button>
                <button
                  type="button"
                  className="mh-btn mh-btn--reject"
                  onClick={() => onReject(track.id)}
                >
                  <i className="fas fa-times" /> رد
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
