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

export default function MusicSection() {
  const [activeTab, setActiveTab] = useState("search");

  const [tracks, setTracks] = useState([]);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [requestedTracks, setRequestedTracks] = useState([]);

  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  // playing music
  const audioRef = useRef(null);
  const audioCacheRef = useRef({});
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [query, setQuery] = useState("");
  const [searchUrl, setSearchUrl] = useState("");

  const [searching, setSearching] = useState(false);

  const [loadingArchive, setLoadingArchive] = useState(false);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return tracks;

    return tracks.filter(
      (s) =>
        (s.title || "").toLowerCase().includes(q) ||
        (s.artist || "").toLowerCase().includes(q),
    );
  }, [query, tracks]);

  const archiveCapacityText = `${tracks.length} / ${MAX_TRACKS}`;
  const playlistCapacityText = `${playlistTracks.length} / ${MAX_TRACKS}`;
  const hasArchiveCapacity = tracks.length < MAX_TRACKS;

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

    console.log("Searching URL:", searchUrl);

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
          setPlayingTrackId(musicTrackId);
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

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      audioRef.current.pause();
      audioRef.current.src = audioUrl;

      audioRef.current.onended = () => {
        setPlayingTrackId(null);
        setIsPlaying(false);
      };

      await audioRef.current.play();

      setPlayingTrackId(musicTrackId);
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
      alert("خطا در پخش موسیقی");
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
      <div className="music-flex">
        <div className="panel music-pane">
          <div className="view-header">
            <h3>آرشیو موسیقی</h3>
            <span className="playlist-capacity">{archiveCapacityText}</span>
          </div>

          <div className="music-tab-bar" style={{ marginTop: "12px" }}>
            <button
              type="button"
              className={`music-tab-btn ${
                activeTab === "search" ? "active" : ""
              }`}
              onClick={() => setActiveTab("search")}
            >
              <i className="fas fa-archive" /> مدیریت آرشیو
            </button>

            <button
              type="button"
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

              <div className="search-results" style={{ marginTop: 12 }}>
                {loadingArchive && (
                  <div className="empty-hint">در حال دریافت آرشیو...</div>
                )}

                {!loadingArchive &&
                  searchResults.map((r) => (
                    <div key={r.id} className="search-result-item">
                      <div className="song-info">
                        <i className="fas fa-music"></i>
                        {r.artworkUrl ? (
                          <img
                            src={r.artworkUrl}
                            className="song-artwork"
                            alt=""
                          />
                        ) : (
                          <div className="song-artwork placeholder-art" />
                        )}

                        <div>
                          <span className="song-title">{r.title}</span>

                          <span className="song-artist">{r.artist}</span>
                        </div>
                      </div>

                      <div
                        className="row-actions"
                        style={{
                          display: "flex",
                          gap: "4px",
                        }}
                      >
                        <button
                          type="button"
                          className="btn btn-icon btn-secondary"
                          title="پخش آهنگ"
                          onClick={() => handlePlayTrack(r.id)}
                        >
                          <i
                            className={
                              playingTrackId === r.id && isPlaying
                                ? "fas fa-pause"
                                : "fas fa-play"
                            }
                          />
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
                  ))}
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
                style={{
                  display: "block",
                  marginTop: 8,
                }}
              >
                لینک مستقیم فایل صوتی یا صفحه آهنگ را قرار داده و جستجو را
                بزنید.
              </small>
            </div>
          )}
        </div>

        <div className="panel playlist-panel">
          <div className="view-header">
            <h3>پلی‌لیست ادمین</h3>
            {loadingPlaylist && (
              <div className="empty-hint">در حال دریافت پلی‌لیست...</div>
            )}
          </div>

          <div className="playlist">
            {!loadingPlaylist && playlistTracks.length === 0 && (
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
                    type="button"
                    className="btn btn-icon btn-secondary"
                    title="پخش آهنگ"
                    onClick={() => handlePlayTrack(s.musicTrackId)}
                  >
                    <i
                      className={
                        playingTrackId === s.musicTrackId && isPlaying
                          ? "fas fa-pause"
                          : "fas fa-play"
                      }
                    />
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
            ))}
          </div>
        </div>
      </div>

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
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
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
                      style={{
                        width: "40px",
                        height: "40px",
                      }}
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
                      <i className="fas fa-check" />
                      <span>تایید</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRejectRequest(track.id)}
                    >
                      <i className="fas fa-times" />
                      <span>رد</span>
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
