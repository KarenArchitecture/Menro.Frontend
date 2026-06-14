import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  getTracks,
  getTrack,
  createTrack,
  deleteTrack,
  getPlaylists,
  getPlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
} from "../../api/music";

const MAX_TRACKS = 50;

// تابع کمکی برای فرمت زمان (ثانیه به دقیقه:ثانیه)
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export default function MusicSection() {
  const [activeTab, setActiveTab] = useState("search");

  const [tracks, setTracks] = useState([]);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [requestedTracks, setRequestedTracks] = useState([]);

  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  // Modal State برای پلی لیست (استاتیک)
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlistModalMode, setPlaylistModalMode] = useState("add"); // 'add' | 'edit'
  const [playlistFormName, setPlaylistFormName] = useState("");
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);

  // Playing music
  const audioRef = useRef(null);
  const audioCacheRef = useRef({});
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [query, setQuery] = useState("");
  const [searchUrl, setSearchUrl] = useState("");
  const [playlistQuery, setPlaylistQuery] = useState(""); // سرچ استاتیک داخل پلی لیست

  const [searching, setSearching] = useState(false);

  const [loadingArchive, setLoadingArchive] = useState(false);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);

  // فیلتر آرشیو
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter(
      (s) =>
        (s.title || "").toLowerCase().includes(q) ||
        (s.artist || "").toLowerCase().includes(q),
    );
  }, [query, tracks]);

  // فیلتر استاتیک پلی‌لیست
  const filteredPlaylistTracks = useMemo(() => {
    const q = playlistQuery.trim().toLowerCase();
    if (!q) return playlistTracks;
    return playlistTracks.filter(
      (s) =>
        (s.title || "").toLowerCase().includes(q) ||
        (s.artist || "").toLowerCase().includes(q),
    );
  }, [playlistQuery, playlistTracks]);

  const archiveCapacityText = `${tracks.length} / ${MAX_TRACKS}`;
  const hasArchiveCapacity = tracks.length < MAX_TRACKS;

  // آپدیت زمان پخش آهنگ برای پلیر سراسری
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setPlayingTrackId(null);
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const refreshPlaylist = async (playlistId) => {
    if (!playlistId) return;
    setLoadingPlaylist(true);

    try {
      const res = await getPlaylist(playlistId);
      const mapped = res.data.tracks.map((t) => ({
        id: t.id,
        musicTrackId: t.musicTrackId,
        title: t.title,
        artist: t.artist || "—",
        duration: t.duration,
        artworkUrl: t.coverUrl,
        audioUrl: t.audioUrl,
        source: "playlist",
      }));
      setPlaylistTracks(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlaylist(false);
    }
  };

  useEffect(() => {
    const loadTracks = async () => {
      setLoadingArchive(true);
      try {
        const res = await getTracks();
        const mapped = res.data.map((t) => ({
          id: t.id,
          title: t.title,
          artist: t.artist || "—",
          duration: t.duration,
          isActive: t.isActive,
          source: "archive",
          coverFileName: t.coverFileName,
          artworkUrl: t.coverFileName,
        }));
        setTracks(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingArchive(false);
      }
    };
    loadTracks();
  }, []);

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const res = await getPlaylists();
        setPlaylists(res.data || []);
        const firstId = res.data?.[0]?.id;
        if (firstId) {
          setSelectedPlaylistId(firstId);
          await refreshPlaylist(firstId);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadPlaylists();
  }, []);

  useEffect(() => {
    if (!selectedPlaylistId) return;
    refreshPlaylist(selectedPlaylistId);
  }, [selectedPlaylistId]);

  // -------------------------
  // Local/Static Handlers
  // -------------------------
  const handleEditTrackName = (trackId, currentTitle) => {
    const newTitle = prompt("نام جدید آهنگ را وارد کنید:", currentTitle);
    if (newTitle && newTitle.trim() !== "") {
      setTracks((prev) =>
        prev.map((t) => (t.id === trackId ? { ...t, title: newTitle } : t)),
      );
      setPlaylistTracks((prev) =>
        prev.map((t) =>
          t.musicTrackId === trackId || t.id === trackId
            ? { ...t, title: newTitle }
            : t,
        ),
      );
    }
  };

  const movePlaylistTrack = (index, direction) => {
    const newOrder = [...playlistTracks];
    if (direction === "up" && index > 0) {
      [newOrder[index - 1], newOrder[index]] = [
        newOrder[index],
        newOrder[index - 1],
      ];
    } else if (direction === "down" && index < newOrder.length - 1) {
      [newOrder[index + 1], newOrder[index]] = [
        newOrder[index],
        newOrder[index + 1],
      ];
    }
    setPlaylistTracks(newOrder);
  };

  const openAddPlaylistModal = () => {
    setPlaylistModalMode("add");
    setPlaylistFormName("");
    setShowPlaylistModal(true);
  };

  const openEditPlaylistModal = (pl) => {
    setPlaylistModalMode("edit");
    setEditingPlaylistId(pl.id);
    setPlaylistFormName(pl.title || pl.name || `پلی‌لیست ${pl.id}`);
    setShowPlaylistModal(true);
  };

  const submitPlaylistModal = (e) => {
    e.preventDefault();
    if (!playlistFormName.trim()) return;

    if (playlistModalMode === "add") {
      const newPl = { id: Date.now().toString(), title: playlistFormName };
      setPlaylists([...playlists, newPl]);
      setSelectedPlaylistId(newPl.id);
      setPlaylistTracks([]);
    } else {
      setPlaylists(
        playlists.map((p) =>
          p.id === editingPlaylistId ? { ...p, title: playlistFormName } : p,
        ),
      );
    }
    setShowPlaylistModal(false);
  };

  const handleDeletePlaylist = (id) => {
    if (window.confirm("آیا از حذف این پلی‌لیست اطمینان دارید؟")) {
      const filtered = playlists.filter((p) => p.id !== id);
      setPlaylists(filtered);
      if (selectedPlaylistId === id) {
        setSelectedPlaylistId(filtered[0]?.id || null);
        setPlaylistTracks([]);
      }
    }
  };

  // -------------------------
  // Existing Handlers
  // -------------------------
  const addToPlaylist = async (track) => {
    if (!selectedPlaylistId) return;
    try {
      await addTrackToPlaylist(selectedPlaylistId, {
        musicTrackId: track.id,
      });
      await refreshPlaylist(selectedPlaylistId);
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromPlaylist = async (playlistTrackId) => {
    if (!selectedPlaylistId) return;
    try {
      await removeTrackFromPlaylist(selectedPlaylistId, playlistTrackId);
      await refreshPlaylist(selectedPlaylistId);
    } catch (err) {
      console.error(err);
      alert("حذف از پلی‌لیست ناموفق بود");
    }
  };

  const deleteTrackFromArchive = async (id) => {
    const backup = tracks.find((t) => t.id === id);
    setTracks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTrack(id);
      setPlaylistTracks((prev) => prev.filter((p) => p.musicTrackId !== id));
    } catch {
      setTracks((prev) => [...prev, backup]);
      alert("حذف ناموفق بود");
    }
  };

  const onUploadFiles = async (files) => {
    if (!files?.length) return;
    let audioFiles = Array.from(files).filter((f) =>
      f.type.startsWith("audio/"),
    );
    if (!audioFiles.length) return;

    const remainingCapacity = MAX_TRACKS - tracks.length;
    if (audioFiles.length > remainingCapacity) {
      alert(
        `ظرفیت آرشیو محدود است. شما فقط می‌توانید ${remainingCapacity} فایل دیگر به آرشیو اضافه کنید.`,
      );
      audioFiles = audioFiles.slice(0, remainingCapacity);
      if (!audioFiles.length) return;
    }

    for (const file of audioFiles) {
      try {
        const formData = new FormData();
        formData.append("Title", file.name.replace(/\.[^/.]+$/, ""));
        formData.append("Artist", "—");
        formData.append("AudioFile", file);

        const res = await createTrack(formData);
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
        console.error(err);
        alert("خطا در آپلود موسیقی");
      }
    }
  };

  const handleSearchSubmit = (e) => {
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
    alert(
      `در حال جستجوی لینک: ${searchUrl}\n(اتصال به API در اینجا قرار میگیرد)`,
    );
    setSearchUrl("");
  };

  const handleApproveRequest = async (track) => {
    if (!hasArchiveCapacity) {
      alert("ظرفیت آرشیو پر شده است.");
      return;
    }
    try {
      setRequestedTracks((prev) => prev.filter((t) => t.id !== track.id));
      setTracks((prev) => [...prev, track]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectRequest = async (trackId) => {
    try {
      setRequestedTracks((prev) => prev.filter((t) => t.id !== trackId));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlayTrack = async (musicTrackId) => {
    try {
      if (playingTrackId === musicTrackId && audioRef.current) {
        if (audioRef.current.paused) {
          await audioRef.current.play();
          setIsPlaying(true);
        } else {
          audioRef.current.pause();
          setIsPlaying(false);
        }
        return;
      }

      if (!audioCacheRef.current[musicTrackId]) {
        const res = await getTrack(musicTrackId);
        audioCacheRef.current[musicTrackId] = res.data.audioUrl;
      }

      const audioUrl = audioCacheRef.current[musicTrackId];
      if (!audioUrl) {
        alert("فایل صوتی یافت نشد");
        return;
      }

      audioRef.current.pause();
      audioRef.current.src = audioUrl;

      await audioRef.current.play();
      setPlayingTrackId(musicTrackId);
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
      alert("خطا در پخش موسیقی");
    }
  };

  const toggleGlobalPlay = () => {
    if (!audioRef.current || !playingTrackId) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      audioRef.current.currentTime = e.target.value;
      setCurrentTime(e.target.value);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "100%",
      }}
    >
      {/* ---------------------------------
          Global Player (بالای همه بخش‌ها)
      --------------------------------- */}
      <div
        className="panel global-player"
        style={{
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          background: "#1e1e1e",
          borderRadius: "8px",
          border: "1px solid #333",
        }}
      >
        <button
          type="button"
          className="btn btn-icon btn-primary"
          onClick={toggleGlobalPlay}
          disabled={!playingTrackId}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#ff9800",
            color: "#fff",
            border: "none",
          }}
        >
          <i
            className={isPlaying ? "fas fa-pause" : "fas fa-play"}
            style={{ fontSize: "20px" }}
          />
        </button>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "14px",
              color: "#ff9800",
              fontWeight: "bold",
            }}
          >
            <span>
              {playingTrackId
                ? tracks.find((t) => t.id === playingTrackId)?.title ||
                  playlistTracks.find((t) => t.musicTrackId === playingTrackId)
                    ?.title ||
                  "در حال پخش..."
                : "آهنگی در حال پخش نیست"}
            </span>
            <span
              style={{
                color: "#aaa",
                fontWeight: "normal",
                fontSize: "12px",
                direction: "ltr",
              }}
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            disabled={!playingTrackId}
            style={{ width: "100%", accentColor: "#ff9800", cursor: "pointer" }}
          />
        </div>
      </div>

      <div
        className="music-flex"
        style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}
      >
        {/* ---------------------------------
            آرشیو موسیقی
        --------------------------------- */}
        <div className="panel music-pane" style={{ flex: "1" }}>
          <div className="view-header">
            <h3>آرشیو موسیقی</h3>
            <span className="playlist-capacity">{archiveCapacityText}</span>
          </div>

          <div className="music-tab-bar" style={{ marginTop: "12px" }}>
            <button
              type="button"
              className={`music-tab-btn ${activeTab === "search" ? "active" : ""}`}
              onClick={() => setActiveTab("search")}
            >
              <i className="fas fa-archive" /> مدیریت آرشیو
            </button>
            <button
              type="button"
              className={`music-tab-btn ${activeTab === "online" ? "active" : ""}`}
              onClick={() => setActiveTab("online")}
            >
              <i className="fas fa-globe" /> جستجوی آنلاین آهنگ
            </button>
          </div>

          {activeTab === "search" && (
            <div className="music-tab-content">
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
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={searching}
                >
                  {searching ? "..." : "جستجو"}
                </button>
              </form>

              <div style={{ marginTop: "12px", marginBottom: "12px" }}>
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
                  <i className="fas fa-cloud-upload-alt" />
                  بارگذاری فایل جدید از سیستم
                </label>
              </div>

              {/* اعمال Max-Height روی جستجوها */}
              <div
                className="search-results"
                style={{
                  marginTop: 12,
                  maxHeight: "350px",
                  overflowY: "auto",
                  paddingRight: "8px",
                }}
              >
                {loadingArchive && (
                  <div className="empty-hint">در حال دریافت آرشیو...</div>
                )}

                {!loadingArchive &&
                  searchResults.map((r) => {
                    const isTrackPlaying = playingTrackId === r.id;
                    return (
                      <div
                        key={r.id}
                        className="search-result-item"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div
                          className="song-info"
                          style={{
                            display: "flex",
                            gap: "12px",
                            alignItems: "center",
                          }}
                        >
                          <i
                            className="fas fa-music"
                            style={{ color: "#555" }}
                          ></i>

                          {/* کاور با قابلیت کلیک برای پخش (Overlay) */}
                          <div
                            style={{
                              position: "relative",
                              width: 48,
                              height: 48,
                              borderRadius: 8,
                              overflow: "hidden",
                              cursor: "pointer",
                            }}
                            onClick={() => handlePlayTrack(r.id)}
                          >
                            {r.artworkUrl ? (
                              <img
                                src={r.artworkUrl}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                alt=""
                              />
                            ) : (
                              <div
                                className="placeholder-art"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  background: "#444",
                                }}
                              />
                            )}
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: isTrackPlaying
                                  ? "rgba(0,0,0,0.6)"
                                  : "rgba(0,0,0,0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <i
                                className={
                                  isTrackPlaying && isPlaying
                                    ? "fas fa-pause"
                                    : "fas fa-play"
                                }
                                style={{ color: "#fff", fontSize: "16px" }}
                              />
                            </div>
                          </div>

                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            {/* رنگ نارنجی در صورت پخش */}
                            <span
                              className="song-title"
                              style={{
                                color: isTrackPlaying ? "#ff9800" : "inherit",
                                fontWeight: isTrackPlaying ? "bold" : "normal",
                              }}
                            >
                              {r.title}
                            </span>
                            <span
                              className="song-artist"
                              style={{ fontSize: "12px", color: "#888" }}
                            >
                              {r.artist} • {formatTime(r.duration)}
                            </span>
                          </div>
                        </div>

                        <div
                          className="row-actions"
                          style={{ display: "flex", gap: "4px" }}
                        >
                          {/* جایگزین دکمه پخش با دکمه ویرایش (قلم) */}
                          <button
                            type="button"
                            className="btn btn-icon btn-secondary"
                            title="ویرایش نام"
                            onClick={() => handleEditTrackName(r.id, r.title)}
                          >
                            <i className="fas fa-pencil-alt" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-icon btn-secondary"
                            title="افزودن به پلی‌لیست"
                            onClick={() => addToPlaylist(r)}
                          >
                            <i className="fas fa-plus" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-icon btn-danger"
                            title="حذف از آرشیو"
                            onClick={() => deleteTrackFromArchive(r.id)}
                          >
                            <i className="fas fa-trash" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {activeTab === "online" && (
            <div className="music-tab-content">
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

        {/* ---------------------------------
            پلی‌لیست ادمین (همراه با سایدبار)
        --------------------------------- */}
        <div
          className="panel playlist-panel"
          style={{ flex: "1.5", display: "flex", flexDirection: "column" }}
        >
          <div className="view-header" style={{ marginBottom: "16px" }}>
            <h3>مدیریت پلی‌لیست‌ها</h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={openAddPlaylistModal}
            >
              <i className="fas fa-plus" /> پلی‌لیست جدید
            </button>
          </div>

          <div style={{ display: "flex", gap: "16px", flex: 1 }}>
            {/* Sidebar برای لیست پلی‌لیست‌ها */}
            <div
              style={{
                width: "35%",
                borderLeft: "1px solid #333",
                paddingLeft: "12px",
                overflowY: "auto",
                maxHeight: "400px",
              }}
            >
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  style={{
                    padding: "10px",
                    marginBottom: "8px",
                    borderRadius: "6px",
                    background:
                      selectedPlaylistId === pl.id ? "#333" : "transparent",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onClick={() => setSelectedPlaylistId(pl.id)}
                >
                  <span
                    style={{
                      fontWeight:
                        selectedPlaylistId === pl.id ? "bold" : "normal",
                      color:
                        selectedPlaylistId === pl.id ? "#ff9800" : "inherit",
                    }}
                  >
                    {pl.title || pl.name || "پلی‌لیست"}
                  </span>

                  {selectedPlaylistId === pl.id && (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="btn btn-icon btn-secondary"
                        style={{ width: 24, height: 24, padding: 0 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditPlaylistModal(pl);
                        }}
                      >
                        <i
                          className="fas fa-pencil-alt"
                          style={{ fontSize: 10 }}
                        />
                      </button>
                      <button
                        className="btn btn-icon btn-danger"
                        style={{ width: 24, height: 24, padding: 0 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlaylist(pl.id);
                        }}
                      >
                        <i className="fas fa-trash" style={{ fontSize: 10 }} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {playlists.length === 0 && (
                <span style={{ fontSize: 12, color: "#aaa" }}>
                  هیچ پلی‌لیستی ندارید
                </span>
              )}
            </div>

            {/* بخش آهنگ‌های داخل پلی‌لیست */}
            <div
              style={{
                width: "65%",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {/* فیلد سرچ استاتیک برای پلی‌لیست */}
              <input
                type="text"
                placeholder="جستجو در این پلی‌لیست..."
                value={playlistQuery}
                onChange={(e) => setPlaylistQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #444",
                  background: "#222",
                  color: "#fff",
                }}
              />

              <div
                className="playlist"
                style={{
                  overflowY: "auto",
                  maxHeight: "350px",
                  paddingRight: "8px",
                }}
              >
                {loadingPlaylist && (
                  <div className="empty-hint">در حال دریافت...</div>
                )}

                {!loadingPlaylist && filteredPlaylistTracks.length === 0 && (
                  <div className="empty-hint">آهنگی یافت نشد</div>
                )}

                {filteredPlaylistTracks.map((s, index) => {
                  const isTrackPlaying = playingTrackId === s.musicTrackId;
                  return (
                    <div
                      key={s.id}
                      className="playlist-item"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        className="song-info"
                        style={{
                          display: "flex",
                          gap: "12px",
                          alignItems: "center",
                        }}
                      >
                        {/* دکمه‌های جابجایی Up/Down به جای Drag */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                          }}
                        >
                          <button
                            className="btn btn-icon"
                            style={{
                              width: 20,
                              height: 20,
                              padding: 0,
                              background: "transparent",
                              color: index === 0 ? "#444" : "#fff",
                              border: "none",
                            }}
                            disabled={index === 0}
                            onClick={() => movePlaylistTrack(index, "up")}
                          >
                            <i
                              className="fas fa-chevron-up"
                              style={{ fontSize: 12 }}
                            />
                          </button>
                          <button
                            className="btn btn-icon"
                            style={{
                              width: 20,
                              height: 20,
                              padding: 0,
                              background: "transparent",
                              color:
                                index === filteredPlaylistTracks.length - 1
                                  ? "#444"
                                  : "#fff",
                              border: "none",
                            }}
                            disabled={
                              index === filteredPlaylistTracks.length - 1
                            }
                            onClick={() => movePlaylistTrack(index, "down")}
                          >
                            <i
                              className="fas fa-chevron-down"
                              style={{ fontSize: 12 }}
                            />
                          </button>
                        </div>

                        {/* کاور با Play/Pause Overlay */}
                        <div
                          style={{
                            position: "relative",
                            width: 48,
                            height: 48,
                            borderRadius: 8,
                            overflow: "hidden",
                            cursor: "pointer",
                          }}
                          onClick={() => handlePlayTrack(s.musicTrackId)}
                        >
                          {s.artworkUrl ? (
                            <img
                              src={s.artworkUrl}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              alt=""
                            />
                          ) : (
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                background: "#444",
                              }}
                              className="placeholder-art"
                            />
                          )}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: isTrackPlaying
                                ? "rgba(0,0,0,0.6)"
                                : "rgba(0,0,0,0.3)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <i
                              className={
                                isTrackPlaying && isPlaying
                                  ? "fas fa-pause"
                                  : "fas fa-play"
                              }
                              style={{ color: "#fff", fontSize: "16px" }}
                            />
                          </div>
                        </div>

                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span
                            className="song-title"
                            style={{
                              color: isTrackPlaying ? "#ff9800" : "inherit",
                              fontWeight: isTrackPlaying ? "bold" : "normal",
                            }}
                          >
                            {s.title}
                          </span>
                          <span
                            className="song-artist"
                            style={{ fontSize: "12px", color: "#888" }}
                          >
                            {s.artist} • {formatTime(s.duration)}
                          </span>
                        </div>
                      </div>

                      <div
                        className="row-actions"
                        style={{ display: "flex", gap: "4px" }}
                      >
                        {/* دکمه ویرایش محلی */}
                        <button
                          type="button"
                          className="btn btn-icon btn-secondary"
                          title="ویرایش نام"
                          onClick={() => handleEditTrackName(s.id, s.title)}
                        >
                          <i className="fas fa-pencil-alt" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-icon btn-danger"
                          onClick={() => removeFromPlaylist(s.id)}
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
      </div>

      {/* ---------------------------------
          آهنگ‌های درخواستی
      --------------------------------- */}
      <div className="panel w-full">
        <div className="view-header" style={{ marginBottom: "16px" }}>
          <h3>آهنگ‌های درخواستی</h3>
          <span className="playlist-capacity">
            {requestedTracks.length} درخواست
          </span>
        </div>

        {/* Max-Height روی لیست درخواست‌ها */}
        <div
          className="requests-list"
          style={{ maxHeight: "300px", overflowY: "auto" }}
        >
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
                  {/* ...همان کدهای قبلی درخواست... */}
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
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleApproveRequest(track)}
                    >
                      <i className="fas fa-check" /> <span>تایید</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRejectRequest(track.id)}
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

      {/* ---------------------------------
          مودال ساخت/ویرایش پلی‌لیست
      --------------------------------- */}
      {showPlaylistModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#222",
              padding: "24px",
              borderRadius: "8px",
              width: "320px",
              border: "1px solid #444",
            }}
          >
            <h4 style={{ margin: "0 0 16px 0", color: "#fff" }}>
              {playlistModalMode === "add"
                ? "ایجاد پلی‌لیست جدید"
                : "ویرایش پلی‌لیست"}
            </h4>
            <form onSubmit={submitPlaylistModal}>
              <input
                type="text"
                value={playlistFormName}
                onChange={(e) => setPlaylistFormName(e.target.value)}
                placeholder="نام پلی‌لیست را وارد کنید..."
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "16px",
                  borderRadius: "4px",
                  border: "1px solid #444",
                  background: "#111",
                  color: "#fff",
                }}
                autoFocus
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPlaylistModal(false)}
                >
                  لغو
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!playlistFormName.trim()}
                >
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
