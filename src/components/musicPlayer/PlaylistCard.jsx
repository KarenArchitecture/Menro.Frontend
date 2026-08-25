// src/components/musicPlayer/PlaylistCard.jsx
import React, { useMemo, useState } from "react";
import { MAX_PLAYLISTS, formatDuration } from "../../utils/musicFormatters";

/**
 * کارت «مدیریت پلی‌لیست‌ها». playlistQuery و فیلتر آهنگ‌های پلی‌لیست
 * محلیِ همین کامپوننت‌اند؛ playlistTracks خام از MusicSection می‌آید
 * چون در منطق پخش (next/previous/nowPlaying) هم استفاده می‌شود.
 */
export default function PlaylistCard({
  playlists,
  selectedPlaylistId,
  playlistTracks,
  loadingPlaylist,
  playingPlaylistTrackId,
  isPlaying,
  onCreatePlaylist,
  onEditPlaylist,
  onDeletePlaylist,
  onSelectPlaylist,
  onPlayTrack,
  onMoveTrack,
  onRemoveTrack,
}) {
  const [playlistQuery, setPlaylistQuery] = useState("");
  const [brokenThumbs, setBrokenThumbs] = useState(() => new Set());
  const filteredPlaylistTracks = useMemo(() => {
    const q = playlistQuery.trim().toLowerCase();
    if (!q) return playlistTracks;
    return playlistTracks.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.artist?.toLowerCase().includes(q),
    );
  }, [playlistQuery, playlistTracks]);

  return (
    <div className="music-card playlist-card" style={{ flex: 1.5 }}>
      <div className="music-card__header">
        <h3 className="music-card__title">
          <span className="icon-badge">
            <i className="fas fa-list-music" />
          </span>
          مدیریت پلی‌لیست‌ها
          <span className="pill-count">
            {playlists.length} / {MAX_PLAYLISTS}
          </span>
        </h3>
        <button
          className="mh-btn mh-btn--primary"
          onClick={onCreatePlaylist}
          disabled={playlists.length >= MAX_PLAYLISTS}
        >
          <i className="fas fa-plus" /> پلی‌لیست جدید
        </button>
      </div>

      <div className="playlist-card__body">
        {/* Sidebar برای لیست پلی‌لیست‌ها */}
        <div className="playlist-rail">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              className={`playlist-rail__item ${
                selectedPlaylistId === pl.id ? "is-active" : ""
              }`}
              onClick={() => onSelectPlaylist(pl.id)}
            >
              <span
                className="playlist-rail__name"
                title={pl.name || "پلی‌لیست"}
              >
                {pl.title || pl.name || "پلی‌لیست"}
              </span>
              <span className="pill-count">{pl.tracks}</span>
              <div className="playlist-rail__actions">
                <button
                  className="mh-icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditPlaylist(pl);
                  }}
                >
                  <i className="fas fa-pencil-alt" />
                </button>
                <button
                  className="mh-icon-btn is-danger"
                  style={{
                    opacity: pl.isActive ? 0.4 : 1,
                    cursor: pl.isActive ? "not-allowed" : "pointer",
                  }}
                  disabled={pl.isActive}
                  title={
                    pl.isActive ? "پلی‌لیست فعال قابل حذف نیست" : "حذف پلی‌لیست"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    if (pl.isActive) return;
                    onDeletePlaylist(pl.id);
                  }}
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
            </div>
          ))}
          {playlists.length === 0 && (
            <div className="mh-empty">هیچ پلی‌لیستی ندارید</div>
          )}
        </div>

        {/* بخش آهنگ‌های داخل پلی‌لیست */}
        <div className="playlist-card__tracks">
          <form className="mh-search-row">
            <input
              type="text"
              className="mh-input"
              placeholder="جستجو در این پلی‌لیست..."
              value={playlistQuery}
              onChange={(e) => setPlaylistQuery(e.target.value)}
            />
          </form>

          <div className="mh-list">
            {!loadingPlaylist && filteredPlaylistTracks.length === 0 && (
              <div className="mh-empty">آهنگی یافت نشد</div>
            )}

            {filteredPlaylistTracks.map((s, index) => {
              const isTrackPlaying = playingPlaylistTrackId === s.id;
              return (
                <div
                  key={s.id}
                  className={`mh-row ${isTrackPlaying ? "is-playing" : ""}`}
                >
                  <div className="mh-row__info">
                    <div className="mh-reorder">
                      <button
                        disabled={index === 0}
                        onClick={() => onMoveTrack(s.id, "up")}
                      >
                        <i className="fas fa-chevron-up" />
                      </button>
                      <button
                        disabled={index === filteredPlaylistTracks.length - 1}
                        onClick={() => onMoveTrack(s.id, "down")}
                      >
                        <i className="fas fa-chevron-down" />
                      </button>
                    </div>

                    <div
                      className="mh-art"
                      onClick={() => onPlayTrack(s.id, s.musicTrackId)}
                    >
                      {s.artworkUrl && !brokenThumbs.has(s.id) ? (
                        <img
                          src={s.artworkUrl}
                          alt=""
                          onError={() =>
                            setBrokenThumbs((prev) => new Set(prev).add(s.id))
                          }
                        />
                      ) : (
                        <i className="fas fa-music mh-art__placeholder" />
                      )}
                      <div
                        className={`mh-art__overlay ${
                          isTrackPlaying ? "is-visible" : ""
                        }`}
                      >
                        <i
                          className={
                            isTrackPlaying && isPlaying
                              ? "fas fa-pause"
                              : "fas fa-play"
                          }
                        />
                      </div>
                    </div>

                    <div className="mh-row__text">
                      <span className="mh-row__title">
                        {s.title}
                        {s.isRequestedTrack && (
                          <span className="mh-chip-requested">درخواستی</span>
                        )}
                      </span>
                      <span className="mh-row__subtitle">
                        {s.artist} • {formatDuration(s.duration)}
                      </span>
                    </div>
                  </div>

                  <div className="mh-row__actions">
                    <button
                      type="button"
                      className="mh-icon-btn is-danger"
                      onClick={() => onRemoveTrack(s.id)}
                      title="حذف از پلی‌لیست"
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
