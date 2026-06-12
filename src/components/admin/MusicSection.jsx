import React, { useEffect, useMemo, useState } from "react";
import {
  getTracks,
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

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const [loadingArchive, setLoadingArchive] = useState(false);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);

  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  /* ---------------- FILTER ---------------- */
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return tracks;

    return tracks.filter(
      (s) =>
        (s.title || "").toLowerCase().includes(q) ||
        (s.artist || "").toLowerCase().includes(q),
    );
  }, [query, tracks]);

  const capacityText = `${playlistTracks.length} / ${MAX_TRACKS}`;

  /* ---------------- HELPERS ---------------- */
  const refreshPlaylist = async (playlistId) => {
    if (!playlistId) return;

    setLoadingPlaylist(true);

    try {
      const res = await getPlaylist(playlistId);

      const mapped = res.data.tracks.map((t) => ({
        id: t.id, // playlistTrackId
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

  /* ---------------- ARCHIVE LOAD ---------------- */
  useEffect(() => {
    const load = async () => {
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

    load();
  }, []);

  /* ---------------- PLAYLISTS LOAD ---------------- */
  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const res = await getPlaylists();

        setPlaylists(res.data || []);

        const firstId = res.data?.[0]?.id;

        if (firstId) {
          setSelectedPlaylistId(firstId);
          refreshPlaylist(firstId);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadPlaylists();
  }, []);

  /* ---------------- SELECTED PLAYLIST CHANGE ---------------- */
  useEffect(() => {
    if (!selectedPlaylistId) return;

    refreshPlaylist(selectedPlaylistId);
  }, [selectedPlaylistId]);

  /* ---------------- ADD ---------------- */
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

  /* ---------------- REMOVE ---------------- */
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

  /* ---------------- DELETE ARCHIVE TRACKS ---------------- */
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

  /* ---------------- UPLOAD ---------------- */
  const onUploadFiles = async (files) => {
    if (!files?.length) return;

    const audioFiles = Array.from(files).filter((f) =>
      f.type.startsWith("audio/"),
    );

    if (!audioFiles.length) return;

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

  return (
    <div className="music-flex">
      {/* RIGHT Archive */}
      <div className="panel music-pane">
        <h3>آرشیو موسیقی</h3>

        <div className="music-tab-bar">
          <button
            className={`music-tab-btn ${
              activeTab === "search" ? "active" : ""
            }`}
            onClick={() => setActiveTab("search")}
          >
            <i className="fas fa-search" /> مدیریت آرشیو
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

                  {/* <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => addToPlaylist(r)}
                    disabled={!hasCapacity}
                  >
                    <i className="fas fa-plus"></i>
                  </button> */}
                  <div className="row-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => addToPlaylist(r)}
                      // disabled={!hasCapacity}
                    >
                      <i className="fas fa-plus" />
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
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

      {/* LEFT, Playlist */}
      <div className="panel playlist-panel">
        <div className="view-header">
          <h3>پلی‌لیست ادمین</h3>
          <span className="playlist-capacity">{capacityText}</span>
        </div>

        <div className="playlist">
          {loadingPlaylist && (
            <div className="empty-hint">در حال دریافت پلی‌لیست...</div>
          )}

          {!loadingPlaylist && playlistTracks.length === 0 && (
            <div className="empty-hint">لیستی وجود ندارد</div>
          )}

          {playlistTracks.map((s) => (
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
