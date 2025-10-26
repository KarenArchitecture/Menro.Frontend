import React, { useEffect, useMemo, useState } from "react";

const MAX_TRACKS = 50;

/** tiny id helper */
const uid = () => Math.random().toString(36).slice(2, 10);

/** mock online catalog (replace with API later) */
const MOCK_CATALOG = [
  {
    id: "yt-1",
    title: "Another Song Title",
    artist: "Another Artist",
    source: "online",
    provider: "YouTube",
    icon: "fab fa-youtube youtube-icon",
  },
  {
    id: "sp-1",
    title: "Music Title 1",
    artist: "Artist Name",
    source: "online",
    provider: "Spotify",
    icon: "fab fa-spotify spotify-icon",
  },
  {
    id: "yt-2",
    title: "Gole Yakh",
    artist: "Kourosh Yaghmaei",
    source: "online",
    provider: "YouTube",
    icon: "fab fa-youtube youtube-icon",
  },
  {
    id: "sp-2",
    title: "Bigharar",
    artist: "Sattar",
    source: "online",
    provider: "Spotify",
    icon: "fab fa-spotify spotify-icon",
  },
];

export default function MusicSection() {
  const [activeTab, setActiveTab] = useState("search"); // 'search' | 'upload'
  const [playlist, setPlaylist] = useState([]); // {id,title,artist,source,artworkUrl?,objectUrl?}
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  // filter the mock catalog (replace with API later)
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_CATALOG;
    return MOCK_CATALOG.filter(
      (s) =>
        s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
    );
  }, [query]);

  const capacityText = `${playlist.length} / ${MAX_TRACKS}`;
  const hasCapacity = playlist.length < MAX_TRACKS;

  // clean up any object URLs created for uploads when removed/unmounted
  useEffect(() => {
    return () => {
      playlist.forEach((t) => t.objectUrl && URL.revokeObjectURL(t.objectUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- actions ----
  const addToPlaylist = (track) => {
    if (!hasCapacity) {
      alert("ظرفیت پلی‌لیست پر شده است.");
      return;
    }
    // naive de-dupe by title+artist
    const key = (s) =>
      `${(s.title || "").toLowerCase()}__${(s.artist || "").toLowerCase()}`;
    const exists = playlist.some((s) => key(s) === key(track));
    if (exists) {
      alert("این آهنگ قبلاً در پلی‌لیست موجود است.");
      return;
    }
    setPlaylist((prev) => [...prev, { ...track, id: track.id || uid() }]);
  };

  const removeFromPlaylist = (id) => {
    setPlaylist((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item?.objectUrl) URL.revokeObjectURL(item.objectUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    // For now, search is instant (filtered from MOCK_CATALOG).
    // You can show a loading state to mimic an API call.
    setSearching(true);
    setTimeout(() => setSearching(false), 300); // fake latency
  };

  const onUploadFiles = async (files) => {
    if (!files?.length) return;
    let added = 0;
    for (const file of files) {
      if (!file.type.startsWith("audio/")) continue;
      if (!hasCapacity) break;

      const objectUrl = URL.createObjectURL(file);
      const title = file.name.replace(/\.[^/.]+$/, "");
      addToPlaylist({
        id: uid(),
        title,
        artist: "—",
        source: "upload",
        artworkUrl: "", // you could extract artwork later
        objectUrl, // keep for preview or player
      });
      added++;
    }
    if (added === 0) {
      if (!hasCapacity) alert("ظرفیت پلی‌لیست پر شده است.");
      else alert("فایل صوتی معتبری انتخاب نشد.");
    }
  };

  return (
    <div className="music-flex">
      {/* LEFT : Admin tools */}
      <div className="panel music-pane">
        <h3>مدیریت پلی‌لیست ادمین</h3>

        {/* Tab bar */}
        <div className="music-tab-bar">
          <button
            className={`music-tab-btn ${
              activeTab === "search" ? "active" : ""
            }`}
            onClick={() => setActiveTab("search")}
          >
            <i className="fas fa-search" /> جستجو آنلاین
          </button>
          <button
            className={`music-tab-btn ${
              activeTab === "upload" ? "active" : ""
            }`}
            onClick={() => setActiveTab("upload")}
          >
            <i className="fas fa-upload" /> آپلود فایل
          </button>
        </div>

        {/* —— SEARCH —— */}
        {activeTab === "search" && (
          <div className="music-tab-content">
            <p className="panel-subtitle">
              نام آهنگ یا هنرمند را وارد کنید و از نتایج آنلاین به پلی‌لیست
              اضافه کنید.
            </p>

            <form className="input-group-inline" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="مثال: Homayoun Shajarian"
                style={{ flexGrow: 1 }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="btn btn-primary" disabled={searching}>
                {searching ? "در حال جستجو…" : "جستجو"}
              </button>
            </form>

            <div className="search-results" style={{ marginTop: 12 }}>
              {searchResults.map((r) => (
                <div key={r.id} className="search-result-item">
                  <div className="song-info">
                    <i className={r.icon}></i>
                    <div>
                      <span className="song-title">{r.title}</span>
                      <span className="song-artist">{r.artist}</span>
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => addToPlaylist(r)}
                    disabled={!hasCapacity}
                    title={!hasCapacity ? "ظرفیت پلی‌لیست تکمیل است" : "افزودن"}
                  >
                    <i className="fas fa-plus"></i> افزودن
                  </button>
                </div>
              ))}
              {searchResults.length === 0 && (
                <div className="empty-hint">نتیجه‌ای یافت نشد.</div>
              )}
            </div>
          </div>
        )}

        {/* —— UPLOAD —— */}
        {activeTab === "upload" && (
          <div className="music-tab-content">
            <p className="panel-subtitle">
              فایل‌های صوتی (mp3, wav, …) را آپلود کنید تا به پلی‌لیست ادمین
              اضافه شوند.
            </p>
            <input
              type="file"
              className="file-input"
              accept="audio/*"
              multiple
              onChange={(e) => onUploadFiles(e.target.files)}
            />
            <button
              className="btn btn-primary"
              style={{ marginTop: 15 }}
              onClick={() => {
                // no-op; files are added onChange to keep UX snappy
              }}
              disabled
              title="پس از انتخاب فایل‌ها، به‌صورت خودکار اضافه می‌شوند"
            >
              آپلود
            </button>
            <small className="muted" style={{ display: "block", marginTop: 8 }}>
              ظرفیت فعلی: {capacityText}
            </small>
          </div>
        )}
      </div>

      {/* RIGHT : Playlist (stateful) */}
      <div className="panel playlist-panel">
        <div className="view-header" style={{ marginBottom: 20 }}>
          <h3>پلی‌لیست ادمین</h3>
          <span className="playlist-capacity">ظرفیت: {capacityText}</span>
        </div>

        <div className="playlist">
          {playlist.length === 0 && (
            <div className="empty-hint">هنوز آهنگی اضافه نشده است.</div>
          )}

          {playlist.map((s) => (
            <div key={s.id} className="playlist-item">
              <div className="song-info">
                <i className="fas fa-grip-vertical drag-handle"></i>
                {s.artworkUrl ? (
                  <img src={s.artworkUrl} className="song-artwork" alt="" />
                ) : (
                  <div className="song-artwork placeholder-art" />
                )}
                <div>
                  <span className="song-title">{s.title}</span>
                  <span className="song-artist">
                    {s.artist}{" "}
                    {s.source === "upload" ? "· (آپلود)" : "· (آنلاین)"}
                  </span>
                </div>
              </div>

              <div className="row-actions">
                {/* you can add a preview button here using s.objectUrl if uploaded */}
                <button
                  className="btn btn-icon btn-danger"
                  title="حذف"
                  onClick={() => removeFromPlaylist(s.id)}
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions (optional): Save to server later */}
        {/* <div className="playlist-actions">
          <button className="btn btn-primary">ذخیره تغییرات</button>
        </div> */}
      </div>
    </div>
  );
}
