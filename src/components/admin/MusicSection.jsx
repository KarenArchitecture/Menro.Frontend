import React, { useEffect, useMemo, useState, useRef } from "react";
import { getTracks, createTrack, deleteTrack } from "../../api/music";

const MAX_TRACKS = 50;

export default function MusicSection() {
  const [activeTab, setActiveTab] = useState("search"); // 'search' | 'online'

  const [tracks, setTracks] = useState([]); // آرشیو موسیقی
  const [playlistTracks, setPlaylistTracks] = useState([]); // پلی لیست
  const [requestedTracks, setRequestedTracks] = useState([]); // آهنگ‌های درخواستی

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchUrl, setSearchUrl] = useState(""); // استیت برای لینک آنلاین

  const [loadingTracks, setLoadingTracks] = useState(false);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter(
      (s) =>
        (s.title || "").toLowerCase().includes(q) ||
        (s.artist || "").toLowerCase().includes(q),
    );
  }, [query, tracks]);

  // انتقال محدودیت و ظرفیت به آرشیو
  const archiveCapacityText = `${tracks.length} / ${MAX_TRACKS}`;
  const hasArchiveCapacity = tracks.length < MAX_TRACKS;

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
          duration: t.duration,
          isActive: t.isActive,
          source: "archive",
          audioFileName: null,
          coverFileName: t.coverFileName,
          artworkUrl: t.coverFileName,
        }));
        setTracks(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTracks(false);
      }
    };
    load();
  }, []);

  // -------- cleanup ----------
  useEffect(() => {
    return () => {
      playlistTracks.forEach((t) => {
        if (t.objectUrl) {
          URL.revokeObjectURL(t.objectUrl);
        }
      });
    };
  }, [playlistTracks]);

  const addToPlaylist = (track) => {
    const exists = playlistTracks.some((p) => p.id === track.id);
    if (exists) {
      alert("این آهنگ قبلاً در پلی‌لیست وجود دارد.");
      return;
    }
    setPlaylistTracks((prev) => [...prev, track]);
  };

  const removeFromPlaylist = (id) => {
    setPlaylistTracks((prev) => prev.filter((p) => p.id !== id));
  };

  // delete track from db
  const deleteTrackFromArchive = async (id) => {
    const target = tracks.find((t) => t.id === id);
    setTracks((prev) => prev.filter((t) => t.id !== id));

    try {
      await deleteTrack(id);
      setPlaylistTracks((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setTracks((prev) => [...prev, target]);
      alert("حذف ناموفق بود");
    }
  };

  // -------- upload flow (real backend sync) ----------
  const onUploadFiles = async (files) => {
    if (!files?.length) return;

    let audioFiles = Array.from(files).filter((f) =>
      f.type.startsWith("audio/"),
    );

    if (!audioFiles.length) return;

    // بررسی ظرفیت آرشیو قبل از آپلود
    const remainingCapacity = MAX_TRACKS - tracks.length;
    if (audioFiles.length > remainingCapacity) {
      alert(
        `ظرفیت آرشیو محدود است. شما فقط می‌توانید ${remainingCapacity} فایل دیگر به آرشیو اضافه کنید.`,
      );
      audioFiles = audioFiles.slice(0, remainingCapacity);
      if (audioFiles.length === 0) return;
    }

    for (const file of audioFiles) {
      try {
        const formData = new FormData();
        formData.append("Title", file.name.replace(/\.[^/.]+$/, ""));
        formData.append("Artist", "—");
        formData.append("AudioFile", file);

        const res = await createTrack(formData);

        // اضافه شدن موفقیت‌آمیز به آرشیو
        setTracks((prev) => [
          ...prev,
          {
            id: res.data.id,
            title: res.data.title,
            artist: res.data.artist,
            duration: res.data.duration,
            isActive: res.data.isActive,
            source: "archive",
            coverFileName: res.data.coverFileName,
            artworkUrl: res.data.coverFileName,
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

  const handleOnlineSearch = (e) => {
    e.preventDefault();
    if (!searchUrl.trim()) {
      alert("لطفا لینک را وارد کنید.");
      return;
    }
    // در اینجا باید API مربوط به جستجوی آنلاین را فراخوانی کنید
    console.log("Searching URL:", searchUrl);
    alert(
      `در حال جستجوی لینک: ${searchUrl}\n(اتصال به API در اینجا قرار میگیرد)`,
    );
    setSearchUrl("");
  };

  // -------- Requested Tracks Handlers ----------
  const handleApproveRequest = async (track) => {
    // بررسی ظرفیت آرشیو
    if (!hasArchiveCapacity) {
      alert("ظرفیت آرشیو پر شده است. نمی‌توانید آهنگ جدیدی تایید کنید.");
      return;
    }

    try {
      setRequestedTracks((prev) => prev.filter((t) => t.id !== track.id));
      setTracks((prev) => [...prev, track]);
    } catch (error) {
      console.error("Failed to approve track:", error);
      alert("خطا در تایید آهنگ درخواستی");
    }
  };

  const handleRejectRequest = async (trackId) => {
    try {
      setRequestedTracks((prev) => prev.filter((t) => t.id !== trackId));
    } catch (error) {
      console.error("Failed to reject track:", error);
      alert("خطا در رد آهنگ درخواستی");
    }
  };

  // تابع موقت برای دکمه پخش در آرشیو
  const handlePlayTrack = (trackId) => {
    console.log("Play track:", trackId);
  };

  // -------- UI ----------
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "100%",
      }}
    >
      {/* TOP SECTION: Archive & Playlist */}
      <div className="music-flex">
        {/* RIGHT: Archive */}
        <div className="panel music-pane">
          <div className="view-header">
            <h3>آرشیو موسیقی</h3>
            {/* نمایش ظرفیت در بخش آرشیو */}
            <span className="playlist-capacity">{archiveCapacityText}</span>
          </div>

          <div className="music-tab-bar" style={{ marginTop: "12px" }}>
            {/* تب راست: مدیریت آرشیو */}
            <button
              className={`music-tab-btn ${
                activeTab === "search" ? "active" : ""
              }`}
              onClick={() => setActiveTab("search")}
            >
              <i className="fas fa-archive" /> مدیریت آرشیو
            </button>

            {/* تب چپ: جستجوی آنلاین */}
            <button
              className={`music-tab-btn ${
                activeTab === "online" ? "active" : ""
              }`}
              onClick={() => setActiveTab("online")}
            >
              <i className="fas fa-globe" /> جستجوی آنلاین آهنگ
            </button>
          </div>

          {activeTab === "search" && (
            <div className="music-tab-content">
              {/* فرم جستجو در آرشیو */}
              <form
                className="input-group-inline"
                onSubmit={handleSearchSubmit}
              >
                <input
                  type="text"
                  value={query}
                  placeholder="جستجو در آرشیو..."
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button className="btn btn-primary" disabled={searching}>
                  {searching ? "..." : "جستجو"}
                </button>
              </form>

              {/* دکمه آپلود فایل سیستم زیر نوار جستجو */}
              <div style={{ marginTop: "12px", marginBottom: "12px" }}>
                <input
                  type="file"
                  id="file-upload-archive"
                  accept="audio/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => {
                    onUploadFiles(e.target.files);
                    e.target.value = null; // Reset input
                  }}
                />
                <label
                  htmlFor="file-upload-archive"
                  className="btn btn-secondary"
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    margin: 0,
                  }}
                >
                  <i className="fas fa-cloud-upload-alt" /> بارگذاری فایل جدید
                  از سیستم
                </label>
              </div>

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

                    <div
                      className="row-actions"
                      style={{ display: "flex", gap: "4px" }}
                    >
                      {/* دکمه پخش */}
                      <button
                        className="btn btn-icon btn-secondary"
                        title="پخش آهنگ"
                        onClick={() => handlePlayTrack(r.id)}
                      >
                        <i className="fas fa-play" />
                      </button>

                      {/* دکمه افزودن */}
                      <button
                        className="btn btn-icon btn-secondary"
                        title="افزودن به پلی‌لیست"
                        onClick={() => addToPlaylist(r)}
                      >
                        <i className="fas fa-plus" />
                      </button>

                      {/* دکمه حذف */}
                      <button
                        className="btn btn-icon btn-danger"
                        title="حذف از آرشیو"
                        onClick={() => deleteTrackFromArchive(r.id)}
                      >
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "online" && (
            <div className="music-tab-content">
              {/* فرم جستجو با لینک */}
              <form
                className="input-group-inline"
                onSubmit={handleOnlineSearch}
              >
                <input
                  type="url"
                  value={searchUrl}
                  placeholder="لینک آهنگ را وارد کنید..."
                  onChange={(e) => setSearchUrl(e.target.value)}
                  dir="ltr"
                />
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-search" /> جستجو
                </button>
              </form>
              <small
                className="muted"
                style={{ display: "block", marginTop: 8 }}
              >
                لینک مستقیم فایل صوتی یا صفحه آهنگ را قرار داده و جستجو را
                بزنید.
              </small>
            </div>
          )}
        </div>

        {/* LEFT: Playlist */}
        <div className="panel playlist-panel">
          <div className="view-header">
            <h3>پلی‌لیست ادمین</h3>
            <span className="playlist-capacity">
              {playlistTracks.length} آهنگ
            </span>
          </div>

          <div className="playlist">
            {loadingTracks && (
              <div className="empty-hint">در حال دریافت لیست...</div>
            )}

            {!loadingTracks && playlistTracks.length === 0 && (
              <div className="empty-hint">لیستی وجود ندارد</div>
            )}

            {playlistTracks.map((s) => (
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

      {/* BOTTOM SECTION: Requested Songs */}
      <div className="panel w-full">
        <div className="view-header" style={{ marginBottom: "16px" }}>
          <h3>آهنگ‌های درخواستی</h3>
          <span className="playlist-capacity">
            {requestedTracks.length} درخواست
          </span>
        </div>

        <div className="requests-list">
          {requestedTracks.length === 0 ? (
            <div
              className="empty-hint"
              style={{
                padding: "32px 0",
                border: "1px dashed #444",
                borderRadius: "8px",
              }}
            >
              هیچ آهنگ درخواستی جدیدی وجود ندارد
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {requestedTracks.map((track) => (
                <div
                  key={track.id}
                  className="search-result-item"
                  style={{
                    padding: "12px",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                >
                  <div className="song-info">
                    <div
                      className="song-artwork placeholder-art"
                      style={{ width: "40px", height: "40px" }}
                    />
                    <div>
                      <span className="song-title">
                        {track.title || "نامشخص"}
                      </span>
                      <span className="song-artist">
                        {track.artist || "هنرمند نامشخص"}
                      </span>
                    </div>
                  </div>

                  <div className="row-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleApproveRequest(track)}
                      title="تایید و افزودن به آرشیو"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <i className="fas fa-check" /> <span>تایید</span>
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRejectRequest(track.id)}
                      title="رد درخواست"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <i className="fas fa-times" /> <span>رد</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
