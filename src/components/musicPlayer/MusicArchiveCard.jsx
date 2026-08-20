// src/components/musicPlayer/MusicArchiveCard.jsx
import React, { useMemo, useState } from "react";
import { useGlobalUI } from "../common/GlobalUI";
import { MAX_TRACKS, formatDuration } from "../../utils/musicFormatters";

/**
 * کارت «آرشیو موسیقی» (تب مدیریت آرشیو + جستجوی آنلاین).
 * activeTab / query / searchUrl محلیِ همین کامپوننت‌اند چون جای دیگری
 * استفاده نمی‌شوند. tracks خام از MusicSection می‌آید چون در محاسبه‌ی
 * ظرفیت آرشیو (هدر کارت) و توابع حذف/آپلود هم استفاده می‌شود.
 */
export default function MusicArchiveCard({
  tracks,
  loadingArchive,
  playingTrackId,
  isPlaying,
  onUploadFiles,
  onPreviewTrack,
  onEditTrack,
  onAddToPlaylist,
  onDeleteTrack,
}) {
  const { notify } = useGlobalUI();

  const [activeTab, setActiveTab] = useState("search");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchUrl, setSearchUrl] = useState("");

  const archiveCapacityText = `${tracks.length} / ${MAX_TRACKS}`;

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.artist?.toLowerCase().includes(q),
    );
  }, [query, tracks]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearching(true);
    setTimeout(() => setSearching(false), 250);
  };

  // dummy online search!
  const handleOnlineSearch = (e) => {
    e.preventDefault();
    if (!searchUrl.trim()) {
      notify({ type: "warning", message: "لطفا لینک را وارد کنید." });
      return;
    }
    notify({ type: "info", message: `در حال جستجوی لینک: ${searchUrl}` });
    setSearchUrl("");
  };

  return (
    <div className="music-card archive-card" style={{ flex: 1 }}>
      <div className="music-card__header">
        <h3 className="music-card__title">
          <span className="icon-badge">
            <i className="fas fa-compact-disc" />
          </span>
          آرشیو موسیقی
        </h3>
        <span className="pill-count">{archiveCapacityText}</span>
      </div>

      <div className="mh-tabs">
        <button
          type="button"
          className={`mh-tab ${activeTab === "search" ? "is-active" : ""}`}
          onClick={() => setActiveTab("search")}
        >
          <i className="fas fa-archive" /> مدیریت آرشیو
        </button>
        <button
          type="button"
          className={`mh-tab ${activeTab === "online" ? "is-active" : ""}`}
          onClick={() => setActiveTab("online")}
        >
          <i className="fas fa-globe" /> جستجوی آنلاین آهنگ
        </button>
      </div>

      {activeTab === "search" && (
        <div className="music-tab-content">
          <form className="mh-search-row" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="mh-input"
              value={query}
              placeholder="جستجو در آرشیو..."
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="mh-btn mh-btn--primary"
              disabled={searching}
            >
              {searching ? "..." : "جستجو"}
            </button>
          </form>

          <input
            type="file"
            id="file-upload-archive"
            accept="audio/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => {
              onUploadFiles(e.target.files);
              e.target.value = null;
            }}
          />
          <label htmlFor="file-upload-archive" className="mh-upload">
            <i className="fas fa-cloud-upload-alt" /> بارگذاری فایل جدید از
            سیستم
          </label>

          <div className="mh-list">
            {!loadingArchive &&
              searchResults.map((r) => {
                const isTrackPlaying = playingTrackId === r.id;
                const isActive = isTrackPlaying && isPlaying;

                return (
                  <div
                    key={r.id}
                    className={`mh-row ${isTrackPlaying ? "is-playing" : ""}`}
                  >
                    <div className="mh-row__info">
                      <div
                        className="mh-art"
                        onClick={() => onPreviewTrack(r.id, r.audioUrl)}
                      >
                        {r.artworkUrl ? (
                          <img src={r.artworkUrl} alt="" />
                        ) : (
                          <div style={{ width: "100%", height: "100%" }} />
                        )}
                        <div
                          className={`mh-art__overlay ${
                            isTrackPlaying ? "is-visible" : ""
                          }`}
                        >
                          <i
                            className={
                              isActive ? "fas fa-pause" : "fas fa-play"
                            }
                          />
                        </div>
                      </div>

                      <div className="mh-row__text">
                        <span className="mh-row__title">{r.title}</span>
                        <span className="mh-row__subtitle">
                          {r.artist} • {formatDuration(r.duration)}
                        </span>
                      </div>
                    </div>

                    <div className="mh-row__actions">
                      <button
                        onClick={() => onEditTrack(r.id, r.title)}
                        className="mh-icon-btn"
                        title="ویرایش نام"
                      >
                        <i className="fas fa-pencil-alt" />
                      </button>

                      <button
                        onClick={() => onAddToPlaylist(r)}
                        className="mh-icon-btn"
                        title="افزودن به پلی‌لیست"
                      >
                        <i className="fas fa-plus" />
                      </button>

                      <button
                        onClick={() => onDeleteTrack(r.id)}
                        className="mh-icon-btn is-danger"
                        title="حذف از آرشیو"
                      >
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  </div>
                );
              })}

            {!loadingArchive && searchResults.length === 0 && (
              <div className="mh-empty">آهنگی در آرشیو یافت نشد</div>
            )}
          </div>
        </div>
      )}

      {activeTab === "online" && (
        <div className="music-tab-content">
          <form className="mh-search-row" onSubmit={handleOnlineSearch}>
            <input
              type="url"
              className="mh-input"
              value={searchUrl}
              placeholder="لینک آهنگ را وارد کنید..."
              onChange={(e) => setSearchUrl(e.target.value)}
              dir="ltr"
            />
            <button type="submit" className="mh-btn mh-btn--primary">
              <i className="fas fa-search" /> جستجو
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
