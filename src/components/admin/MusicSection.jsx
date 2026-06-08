import React, { useEffect, useMemo, useState } from "react";
import { getTracks, createTrack, deleteTrack } from "../../api/music";

const MAX_TRACKS = 50;

const uid = () => Math.random().toString(36).slice(2, 10);

export default function MusicSection() {
  const [activeTab, setActiveTab] = useState("search");
  const [playlist, setPlaylist] = useState([]);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const [loadingTracks, setLoadingTracks] = useState(false);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return playlist.filter((p) => p.source === "online");
    return playlist.filter(
      (s) =>
        (s.title || "").toLowerCase().includes(q) ||
        (s.artist || "").toLowerCase().includes(q),
    );
  }, [query, playlist]);

  const capacityText = `${playlist.length} / ${MAX_TRACKS}`;
  const hasCapacity = playlist.length < MAX_TRACKS;

  // -------- fetch from backend ----------
  useEffect(() => {
    const load = async () => {
      setLoadingTracks(true);
      try {
        const res = await getTracks();
        const mapped = res.data.map((t) => ({
          id: t.id,
          title: t.title,
          artist: t.artist || "—",
          source: "online",
          audioFileName: t.audioFileName,
          coverFileName: t.coverFileName,
          artworkUrl: t.coverUrl || "",
        }));
        setPlaylist(mapped);
      } finally {
        setLoadingTracks(false);
      }
    };

    load();
  }, []);

  // -------- cleanup ----------
  useEffect(() => {
    return () => {
      playlist.forEach((t) => t.objectUrl && URL.revokeObjectURL(t.objectUrl));
    };
  }, [playlist]);

  // -------- actions ----------
  const addToPlaylist = (track) => {
    if (!hasCapacity) return alert("ظرفیت پلی‌لیست پر شده است.");

    const exists = playlist.some(
      (p) =>
        (p.title || "").toLowerCase() === (track.title || "").toLowerCase() &&
        (p.artist || "").toLowerCase() === (track.artist || "").toLowerCase(),
    );

    if (exists) return alert("این آهنگ قبلاً اضافه شده است.");

    setPlaylist((prev) => [...prev, { ...track, id: track.id || uid() }]);
  };

  const removeFromPlaylist = async (id) => {
    const target = playlist.find((p) => p.id === id);

    // optimistic update
    setPlaylist((prev) => prev.filter((p) => p.id !== id));

    try {
      await deleteTrack(id);
    } catch (err) {
      // rollback
      setPlaylist((prev) => [...prev, target]);
      alert("حذف ناموفق بود");
    }
  };
  // -------- upload flow (real backend sync) ----------
  const onUploadFiles = async (files) => {
    if (!files?.length) return;

    const audioFiles = Array.from(files).filter((f) =>
      f.type.startsWith("audio/"),
    );

    if (!audioFiles.length) return;

    if (!hasCapacity) return;

    for (const file of audioFiles) {
      if (!hasCapacity) break;

      try {
        const formData = new FormData();

        // match backend UploadMusicTrackDto
        formData.append("Title", file.name.replace(/\.[^/.]+$/, ""));
        formData.append("Artist", "—");

        // IMPORTANT: property names MUST match DTO
        formData.append("AudioFile", file);

        // no cover picker anymore
        // optional empty or omit entirely
        // formData.append("CoverFile", null);

        const res = await createTrack(formData);

        setPlaylist((prev) => [
          ...prev,
          {
            id: res.data.id,
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: "—",
            source: "upload",
            audioFileName: file.name,
            coverFileName: null,
            objectUrl: URL.createObjectURL(file),
          },
        ]);
      } catch (err) {
        console.log(err);
        alert("خطا در آپلود موسیقی");
      }
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setSearching(true);
    setTimeout(() => setSearching(false), 250);
  };

  // -------- UI ----------
  return (
    <div className="music-flex">
      {/* LEFT */}
      <div className="panel music-pane">
        <h3>مدیریت پلی‌لیست ادمین</h3>

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

        {activeTab === "search" && (
          <div className="music-tab-content">
            <form className="input-group-inline" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                value={query}
                placeholder="جستجو..."
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="btn btn-primary" disabled={searching}>
                {searching ? "..." : "جستجو"}
              </button>
            </form>

            <div className="search-results" style={{ marginTop: 12 }}>
              {searchResults.map((r) => (
                <div key={r.id} className="search-result-item">
                  <div className="song-info">
                    <i className="fas fa-music"></i>
                    <div>
                      <span className="song-title">{r.title}</span>
                      <span className="song-artist">{r.artist}</span>
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => addToPlaylist(r)}
                    disabled={!hasCapacity}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "upload" && (
          <div className="music-tab-content">
            <input
              type="file"
              className="file-input"
              accept="audio/*"
              multiple
              onChange={(e) => onUploadFiles(e.target.files)}
            />
            <small className="muted" style={{ display: "block", marginTop: 8 }}>
              ظرفیت فعلی: {capacityText}
            </small>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="panel playlist-panel">
        <div className="view-header">
          <h3>پلی‌لیست ادمین</h3>
          <span className="playlist-capacity">{capacityText}</span>
        </div>

        <div className="playlist">
          {loadingTracks && (
            <div className="empty-hint">در حال دریافت لیست...</div>
          )}

          {!loadingTracks && playlist.length === 0 && (
            <div className="empty-hint">لیستی وجود ندارد</div>
          )}

          {playlist.map((s) => (
            <div key={s.id} className="playlist-item">
              <div className="song-info">
                <i className="fas fa-grip-vertical drag-handle"></i>

                {s.artworkUrl ? (
                  <img src={s.artworkUrl} className="song-artwork" />
                ) : (
                  <div className="song-artwork placeholder-art" />
                )}

                <div>
                  <span className="song-title">{s.title}</span>
                  <span className="song-artist">
                    {s.artist} · ({s.source})
                  </span>
                </div>
              </div>

              <div className="row-actions">
                <button
                  className="btn btn-icon btn-danger"
                  onClick={() => removeFromPlaylist(s.id)}
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
