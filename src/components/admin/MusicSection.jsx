import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  getTracks,
  getTrack,
  createTrack,
  deleteTrack,
  createPlaylist,
  getPlaylists,
  getPlaylist,
  renamePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  activatePlaylist,
  renameTrack,
  deletePlaylist,
  reorderPlaylistTrack,
  getTrackRequests,
  rejectTrackRequest,
  approveTrackRequest,
  setCurrentTrack,
  advanceTrack,
  previousTrack,
  getPlayerState,
} from "../../api/music";

const MAX_TRACKS = 50;
const MAX_PLAYLISTS = 10; // ظرفیت پلی لیست ها

// تابع کمکی برای فرمت زمان (ثانیه به دقیقه:ثانیه)
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

// for tracks duration
const formatDuration = (duration) => {
  if (!duration) return "--:--";

  const parts = duration.split(":");

  if (parts.length !== 3) return duration;

  const minutes = parts[1];
  const seconds = parts[2].split(".")[0];

  return `${minutes}:${seconds}`;
};

export default function MusicSection() {
  // fethcing tools
  const [activeTab, setActiveTab] = useState("search");
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const selectedPlaylistIdRef = useRef(selectedPlaylistId);

  useEffect(() => {
    selectedPlaylistIdRef.current = selectedPlaylistId;
  }, [selectedPlaylistId]);
  const [tracks, setTracks] = useState([]);

  // for requests
  const [requestedTracks, setRequestedTracks] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // for playing track (from playlist)
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [playingPlaylistTrackId, setPlayingPlaylistTrackId] = useState(null);

  // Modal State برای پلی لیست
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlistModalMode, setPlaylistModalMode] = useState("add");
  const [playlistFormName, setPlaylistFormName] = useState("");
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Modal State برای ادیت آهنگ
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackFormName, setTrackFormName] = useState("");
  const [editingTrackId, setEditingTrackId] = useState(null);

  // Modal State برای هشدارهای عمومی (جایگزین alert)
  const [alertMessage, setAlertMessage] = useState("");

  //for playlist track preview from archive
  const previewAudioRef = useRef(new Audio());
  const [previewTrackId, setPreviewTrackId] = useState(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTrackTitle, setPreviewTrackTitle] = useState("");
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);

  // Playing music (main player from playlist)
  const audioRef = useRef(null);
  const audioCacheRef = useRef({});
  const isSeekingRef = useRef(false);
  const [playerState, setPlayerState] = useState(null);

  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [query, setQuery] = useState("");
  const [searchUrl, setSearchUrl] = useState("");
  const [playlistQuery, setPlaylistQuery] = useState("");

  const [searching, setSearching] = useState(false);

  const [loadingArchive, setLoadingArchive] = useState(false);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);

  // handlers for ending tracks
  const playlistTracksRef = useRef([]);
  const playingPlaylistTrackIdRef = useRef(null);
  useEffect(() => {
    playlistTracksRef.current = playlistTracks;
  }, [playlistTracks]);

  useEffect(() => {
    playingPlaylistTrackIdRef.current = playingPlaylistTrackId;
  }, [playingPlaylistTrackId]);

  // Modal State برای حذف پلی‌لیست
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter(
      (s) =>
        (s.title || "").toLowerCase().includes(q) ||
        (s.artist || "").toLowerCase().includes(q),
    );
  }, [query, tracks]);

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

  /* --- FETCH DATA --- */
  //--fetch music player
  const loadPlayerState = async () => {
    try {
      const res = await getPlayerState();

      setPlayerState(res.data);

      return res.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };
  //--fetch archive
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
  useEffect(() => {
    loadTracks();
  }, []);
  //--fetch playlists
  const loadPlaylists = async () => {
    try {
      const [playlistRes, player] = await Promise.all([
        getPlaylists(),
        loadPlayerState(),
      ]);

      const playlists = playlistRes.data || [];

      setPlaylists(playlists);

      const playlistId =
        player?.playlistId ??
        playlists.find((x) => x.isActive)?.id ??
        playlists?.[0]?.id;

      if (!playlistId) return;

      setSelectedPlaylistId(playlistId);

      const tracks = await refreshPlaylist(playlistId);

      if (player?.currentPlaylistTrackId) {
        const currentTrack = tracks.find(
          (x) => x.id === player.currentPlaylistTrackId,
        );

        if (currentTrack) {
          setPlayingPlaylistTrackId(currentTrack.id);
          setPlayingTrackId(currentTrack.musicTrackId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    loadPlaylists();
  }, []);
  //--fetch playlist
  const refreshPlaylist = async (playlistId) => {
    if (!playlistId) return [];

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

      return mapped;
    } catch (err) {
      console.error(err);
      return [];
    } finally {
      setLoadingPlaylist(false);
    }
  };
  useEffect(() => {
    if (!selectedPlaylistId) return;
    refreshPlaylist(selectedPlaylistId);
  }, [selectedPlaylistId]);
  //--fetck track requests
  const fetchTrackRequests = async () => {
    try {
      setLoadingRequests(true);

      const response = await getTrackRequests();

      setRequestedTracks(response.data ?? []);
    } catch (error) {
      console.error("Failed to load track requests", error);
    } finally {
      setLoadingRequests(false);
    }
  };
  useEffect(() => {
    fetchTrackRequests();
  }, []);
  // -------------------------
  // Local/Static Handlers
  // -------------------------

  // for MODALS
  const openEditTrackModal = (trackId, currentTitle) => {
    setEditingTrackId(trackId);
    setTrackFormName(currentTitle || "");
    setShowTrackModal(true);
  };

  const submitTrackModal = async (e) => {
    e.preventDefault();

    const title = trackFormName.trim();

    if (!title) return;

    try {
      await renameTrack(editingTrackId, {
        title,
      });

      setTracks((prev) =>
        prev.map((t) => (t.id === editingTrackId ? { ...t, title } : t)),
      );

      if (selectedPlaylistId) {
        await refreshPlaylist(selectedPlaylistId);
      }

      setShowTrackModal(false);
      setTrackFormName("");
      setEditingTrackId(null);
    } catch (err) {
      console.error(err);

      alert(err?.response?.data?.message ?? "خطا در تغییر نام آهنگ");
    }
  };

  const openAddPlaylistModal = () => {
    if (playlists.length >= MAX_PLAYLISTS) {
      setAlertMessage("ظرفیت ساخت پلی‌لیست پر شده است.");
      return;
    }
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

  const submitPlaylistModal = async (e) => {
    e.preventDefault();

    const name = playlistFormName.trim();

    if (!name) return;

    try {
      if (playlistModalMode === "add") {
        const res = await createPlaylist({
          name,
        });

        const newPlaylist = {
          id: res.data.id,
          name: res.data.name,
        };

        setPlaylists((prev) => [...prev, newPlaylist]);

        setSelectedPlaylistId(newPlaylist.id);

        setPlaylistTracks([]);
      } else {
        await renamePlaylist(editingPlaylistId, {
          name,
        });

        setPlaylists((prev) =>
          prev.map((p) =>
            p.id === editingPlaylistId
              ? {
                  ...p,
                  name,
                }
              : p,
          ),
        );
      }

      setPlaylistFormName("");
      setEditingPlaylistId(null);
      setShowPlaylistModal(false);
    } catch (err) {
      console.error(err);

      alert(err?.response?.data?.message ?? "خطا در ذخیره پلی‌لیست");
    }
  };

  // -------------------------
  // Existing Handlers
  // -------------------------
  // add to playlist
  const addToPlaylist = async (track) => {
    if (!selectedPlaylistId) return;
    try {
      await addTrackToPlaylist(selectedPlaylistId, { musicTrackId: track.id });
      await refreshPlaylist(selectedPlaylistId);
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE from Archive/Playist
  // remove playlist
  const handleDeletePlaylist = (id) => {
    setPlaylistToDelete(id);
    setShowDeleteModal(true);
  };
  const handleConfirmDeletePlaylist = async () => {
    if (!playlistToDelete) return;

    try {
      setDeleting(true);

      await deletePlaylist(playlistToDelete);

      setShowDeleteModal(false);
      setPlaylistToDelete(null);

      await loadPlaylists();

      // اگر پلی‌لیست فعال حذف شد
      if (selectedPlaylistId === playlistToDelete) {
        setSelectedPlaylistId(null);
        setPlaylistTracks([]);
      }
    } catch (err) {
      console.error(err);
      alert("حذف پلی‌لیست انجام نشد");
    } finally {
      setDeleting(false);
    }
  };
  // remove track from playlist
  const removeFromPlaylist = async (playlistTrackId) => {
    if (!selectedPlaylistId) return;

    try {
      const oldTracks = [...playlistTracksRef.current];

      const removedIndex = oldTracks.findIndex((x) => x.id === playlistTrackId);

      const isCurrentlyPlaying =
        playlistTrackId === playingPlaylistTrackIdRef.current;

      await removeTrackFromPlaylist(selectedPlaylistId, playlistTrackId);

      // لیست جدید را مستقیم بگیر
      const updatedTracks = await refreshPlaylist(selectedPlaylistId);

      // اگر آهنگ حذف شده در حال پخش نبود
      if (!isCurrentlyPlaying) return;

      // پلی‌لیست خالی شده
      if (!updatedTracks.length) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
        }

        setPlayingTrackId(null);
        setPlayingPlaylistTrackId(null);
        setIsPlaying(false);
        setCurrentTime(0);

        return;
      }

      // آهنگی که باید جایگزین شود
      let trackToPlay = updatedTracks[removedIndex];

      // اگر آخرین آهنگ حذف شده بود
      if (!trackToPlay) {
        trackToPlay = updatedTracks[updatedTracks.length - 1];
      }

      if (!trackToPlay) return;

      // ریست کامل پلیر
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = "";
      }

      setPlayingTrackId(null);
      setPlayingPlaylistTrackId(null);
      setIsPlaying(false);

      await playPlaylistTrack(trackToPlay.id, trackToPlay.musicTrackId);
    } catch (err) {
      console.error(err);
      setAlertMessage("حذف از پلی‌لیست ناموفق بود");
    }
  };
  // delete from archive
  const deleteTrackFromArchive = async (id) => {
    const backup = tracks.find((t) => t.id === id);
    setTracks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTrack(id);
      setPlaylistTracks((prev) => prev.filter((p) => p.musicTrackId !== id));
    } catch {
      setTracks((prev) => [...prev, backup]);
      setAlertMessage("حذف ناموفق بود");
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
      setAlertMessage(
        `ظرفیت آرشیو محدود است. فقط ${remainingCapacity} فایل دیگر مجاز است.`,
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
        setAlertMessage("خطا در آپلود موسیقی");
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
      setAlertMessage("لطفا لینک را وارد کنید.");
      return;
    }
    setAlertMessage(`در حال جستجوی لینک: ${searchUrl}`);
    setSearchUrl("");
  };

  // track requests approve/reject
  const handleApproveRequest = async (track) => {
    try {
      // 1. optimistic UI update (حذف از لیست درخواست‌ها)
      setRequestedTracks((prev) => prev.filter((t) => t.id !== track.id));

      // 2. call backend
      await approveTrackRequest(track.id);

      // 3. refresh playlist (خیلی مهم طبق طراحی تو)
      if (selectedPlaylistId) {
        await refreshPlaylist(selectedPlaylistId);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleRejectRequest = async (trackId) => {
    try {
      await rejectTrackRequest(trackId);

      setRequestedTracks((prev) => prev.filter((t) => t.id !== trackId));
    } catch (err) {
      console.error(err);

      setAlertMessage("خطا در رد درخواست");
    }
  };

  //playing track preview from archive
  const handlePreviewTrack = async (musicTrackId) => {
    try {
      const track = tracks.find((x) => x.id === musicTrackId);

      // همان آهنگ قبلی
      if (previewTrackId === musicTrackId && previewAudioRef.current) {
        if (previewAudioRef.current.paused) {
          await previewAudioRef.current.play();

          setPreviewTrackTitle(track?.title ?? "پیش‌نمایش آهنگ");
          setShowPreviewModal(true);
          setIsPreviewPlaying(true);
        } else {
          previewAudioRef.current.pause();
          setIsPreviewPlaying(false);
        }

        return;
      }

      // لود از کش یا API
      if (!audioCacheRef.current[musicTrackId]) {
        const res = await getTrack(musicTrackId);
        audioCacheRef.current[musicTrackId] = res.data.audioUrl;
      }

      const audioUrl = audioCacheRef.current[musicTrackId];

      if (!audioUrl) {
        setAlertMessage("فایل صوتی یافت نشد");
        return;
      }

      // پخش آهنگ جدید
      previewAudioRef.current.pause();
      previewAudioRef.current.src = audioUrl;

      // check if other player is playing
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      await previewAudioRef.current.play();

      setPreviewTrackId(musicTrackId);
      setPreviewTrackTitle(track?.title ?? "پیش‌نمایش آهنگ");

      setShowPreviewModal(true);
      setIsPreviewPlaying(true);
    } catch (err) {
      console.error(err);
      setAlertMessage("خطا در پخش موسیقی");
    }
  };
  useEffect(() => {
    const audio = previewAudioRef.current;

    const onTimeUpdate = () => {
      setPreviewCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      setPreviewDuration(audio.duration || 0);
    };

    const onEnded = () => {
      setIsPreviewPlaying(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);
  //--close preview modal
  const closePreviewModal = () => {
    previewAudioRef.current.pause();

    setShowPreviewModal(false);
    setPreviewTrackId(null);
    setIsPreviewPlaying(false);

    setPreviewCurrentTime(0);
    setPreviewDuration(0);
  };
  //--seek
  const handlePreviewSeek = (e) => {
    const value = Number(e.target.value);

    previewAudioRef.current.currentTime = value;

    setPreviewCurrentTime(value);
  };

  // PLAYER HELPERS (PLAY/NEXT/PREVIOUS/SHUFFLE)
  //--global Player Functionality
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const updateTime = () => {
      // فقط زمانی که کاربر در حال کشیدن نوار نیست تایم آپدیت شود
      if (!isSeekingRef.current) {
        setCurrentTime(audio.currentTime);
      }
    };
    const updateDuration = () => setDuration(audio.duration);

    const handleEnded = async () => {
      console.log("🔥 END EVENT FIRED");

      const tracks = playlistTracksRef.current;
      const currentId = playingPlaylistTrackIdRef.current;

      const currentIndex = tracks.findIndex((x) => x.id === currentId);

      if (currentIndex === -1) return;

      const nextTrack = tracks[currentIndex + 1];

      if (!nextTrack) return;

      try {
        await syncAndPlay(nextTrack, "next");

        // 🔥 force UI consistency after ended
        if (selectedPlaylistIdRef.current) {
          await refreshPlaylist(selectedPlaylistIdRef.current);
        }

        console.log("🔥 SYNC COMPLETED (ended)");
      } catch (e) {
        console.log("💀 SYNC FAILED:", e);
      }
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
  // const toggleGlobalPlay = async () => {
  //   console.log("🔥 GLOBAL PLAY CLICKED");

  //   if (!audioRef.current) return;

  //   const audio = audioRef.current;

  //   // 1. اگر چیزی در حال پخش نیست → bootstrap واقعی
  //   if (!isPlaying && !playingPlaylistTrackId) {
  //     console.log("🚀 BOOTSTRAP PLAY");

  //     const trackId = playerState?.currentPlaylistTrackId;

  //     let track =
  //       playlistTracks.find((x) => x.id === trackId) || playlistTracks?.[0];

  //     if (!track) {
  //       console.log("❌ NO TRACK AVAILABLE");
  //       return;
  //     }

  //     await playPlaylistTrack(track.id, track.musicTrackId, false);
  //     return;
  //   }

  //   // 2. pause/resume
  //   if (isPlaying) {
  //     audio.pause();
  //     setIsPlaying(false);
  //     return;
  //   }

  //   const playPromise = audio.play();

  //   if (playPromise?.catch) {
  //     playPromise.catch((e) => {
  //       console.log("PLAY ERROR:", e);
  //     });
  //   }

  //   setIsPlaying(true);
  // };

  const toggleGlobalPlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    const currentTrack =
      playlistTracks.find(
        (x) => x.id === playerState?.currentPlaylistTrackId,
      ) || playlistTracks[0];

    if (!currentTrack) return;

    if (!audio.src) {
      await playTrack(currentTrack);
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (e) {
        console.log(e);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };
  //--play from playlist
  const playPlaylistTrack = async (
    playlistTrackId,
    musicTrackId,
    syncPlayerState = true,
  ) => {
    try {
      const audio = audioRef.current;
      if (!audio) return;

      console.log("▶ PLAY TRACK:", playlistTrackId);

      const isSameTrack = playingPlaylistTrackIdRef.current === playlistTrackId;

      if (isSameTrack) {
        if (audio.paused) {
          const p = audio.play();
          if (p?.catch) p.catch(console.log);
          setIsPlaying(true);
        } else {
          audio.pause();
          setIsPlaying(false);
        }
        return;
      }

      if (syncPlayerState) {
        await setCurrentTrack({
          playlistId: selectedPlaylistId,
          playlistTrackId,
        });
      }

      const audioUrl =
        audioCacheRef.current[musicTrackId] ??
        (await getTrack(musicTrackId)).data.audioUrl;

      audioCacheRef.current[musicTrackId] = audioUrl;

      if (!audioUrl) return;

      // ⛔ مهم: STOP everything BEFORE switching src
      audio.pause();
      audio.currentTime = 0;

      // ⛔ جلوگیری از race
      await new Promise((r) => requestAnimationFrame(r));

      audio.src = audioUrl;

      const p = audio.play();

      if (p?.catch) {
        p.catch((e) => {
          console.log("PLAY FAILED:", e);
        });
      }

      setPlayingPlaylistTrackId(playlistTrackId);
      setPlayingTrackId(musicTrackId);
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
    }
  };
  //--central helper for changing playing track *****
  const syncAndPlay = async (track, direction) => {
    if (!track) return;

    if (direction === "prev") {
      await previousTrack({ playlistTrackId: track.id });
    } else {
      await advanceTrack({ playlistTrackId: track.id });
    }

    await refreshPlaylist(selectedPlaylistIdRef.current);

    await playTrack(track);
  };
  //--??
  const getCurrentPlaylistTrackIndex = () => {
    return playlistTracks.findIndex((x) => x.id === playingPlaylistTrackId);
  };
  //--play next track from playlist
  const playNextTrack = async () => {
    const currentIndex = getCurrentPlaylistTrackIndex();

    if (currentIndex === -1) {
      const firstTrack = playlistTracks?.[0];
      await syncAndPlay(firstTrack, "next");
      return;
    }

    const nextTrack = playlistTracks[currentIndex + 1];

    if (!nextTrack) return;

    await syncAndPlay(nextTrack, "next");
  };
  //--play previous track from playlist
  const playPreviousTrack = async () => {
    const currentIndex = getCurrentPlaylistTrackIndex();

    if (currentIndex <= 0) return;

    const previousTrack = playlistTracks[currentIndex - 1];

    await syncAndPlay(previousTrack, "prev");
  };
  //--experimental => central bootstrap and audio manager
  const ensureTrackLoaded = async (track) => {
    if (!track) return false;

    const audio = audioRef.current;
    if (!audio) return false;

    const url =
      audioCacheRef.current[track.musicTrackId] ??
      (await getTrack(track.musicTrackId)).data.audioUrl;

    audioCacheRef.current[track.musicTrackId] = url;

    audio.pause();
    audio.src = url;
    audio.load();

    await new Promise((r) => requestAnimationFrame(r));

    return true;
  };
  const playTrack = async (track) => {
    if (!track) return;

    const ok = await ensureTrackLoaded(track);
    if (!ok) return;

    try {
      await audioRef.current.play();
      setIsPlaying(true);
      setPlayingTrackId(track.musicTrackId);
      setPlayingPlaylistTrackId(track.id);
    } catch (e) {
      console.log("PLAY FAILED:", e);
    }
  };

  // seek helpers
  const handleSeekMouseDown = () => {
    isSeekingRef.current = true;
  };
  const handleSeekChange = (e) => {
    setCurrentTime(Number(e.target.value)); // فقط آپدیت UI هنگام کشیدن
  };
  const handleSeekMouseUp = (e) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(e.target.value); // اعمال روی فایل صوتی در لحظه رها کردن
    }
    isSeekingRef.current = false;
  };

  // re-order tracks in playlist
  const movePlaylistTrack = async (index, direction) => {
    try {
      const track = filteredPlaylistTracks[index];

      await reorderPlaylistTrack(selectedPlaylistId, track.id, direction);

      await refreshPlaylist(selectedPlaylistId);
    } catch (err) {
      console.error(err);
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
          Global Player
      --------------------------------- */}
      <div
        className="panel global-player"
        style={{
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          background: "#1e1e1e",
          borderRadius: "8px",
          border: "1px solid #333",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            direction: "ltr",
          }}
        >
          <button
            className="btn btn-icon btn-secondary"
            title="بر زدن"
            onClick={() => {}}
            style={{ background: "transparent", border: "none", color: "#aaa" }}
          >
            <i className="fas fa-random" />
          </button>
          <button
            className="btn btn-icon btn-secondary"
            title="قبلی"
            onClick={playPreviousTrack}
            style={{ background: "transparent", border: "none", color: "#aaa" }}
          >
            <i className="fas fa-step-backward" style={{ fontSize: "18px" }} />
          </button>

          <button
            type="button"
            className="btn btn-icon btn-primary"
            onClick={toggleGlobalPlay}
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#ff9800",
              color: "#fff",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <i
              className={isPlaying ? "fas fa-pause" : "fas fa-play"}
              style={{ fontSize: "20px" }}
            />
          </button>

          <button
            className="btn btn-icon btn-secondary"
            title="بعدی"
            onClick={playNextTrack}
            style={{ background: "transparent", border: "none", color: "#aaa" }}
          >
            <i className="fas fa-step-forward" style={{ fontSize: "18px" }} />
          </button>
        </div>

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
              {playlistTracks.find((t) => t.id === playingPlaylistTrackId)
                ?.title || "آهنگی در حال پخش نیست"}
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
            onMouseDown={handleSeekMouseDown}
            onChange={handleSeekChange}
            onMouseUp={handleSeekMouseUp}
            onTouchStart={handleSeekMouseDown}
            onTouchEnd={handleSeekMouseUp}
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
                  <i className="fas fa-cloud-upload-alt" /> بارگذاری فایل جدید
                  از سیستم
                </label>
              </div>

              {/* همسان‌سازی ارتفاع با پلی‌لیست */}
              <div
                className="search-results"
                style={{
                  marginTop: 12,
                  maxHeight: "400px",
                  overflowY: "auto",
                  paddingRight: "8px",
                }}
              >
                {/* {loadingArchive && (
                  <div className="empty-hint">در حال دریافت آرشیو...</div>
                )} */}

                {!loadingArchive &&
                  searchResults.map((r) => {
                    const isTrackPlaying = previewTrackId === r.id;
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
                          />

                          <div
                            style={{
                              position: "relative",
                              width: 48,
                              height: 48,
                              borderRadius: 8,
                              overflow: "hidden",
                              cursor: "pointer",
                            }}
                            onClick={() => handlePreviewTrack(r.id)}
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
                                  isTrackPlaying && isPreviewPlaying
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
                              {r.title}
                            </span>
                            <span
                              className="song-artist"
                              style={{ fontSize: "12px", color: "#888" }}
                            >
                              {r.artist} • {formatDuration(r.duration)}
                            </span>
                          </div>
                        </div>

                        <div
                          className="row-actions"
                          style={{ display: "flex", gap: "4px" }}
                        >
                          <button
                            type="button"
                            className="btn btn-icon btn-secondary"
                            title="ویرایش نام"
                            onClick={() => openEditTrackModal(r.id, r.title)}
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
            </div>
          )}
        </div>

        {/* ---------------------------------
            پلی‌لیست ادمین
        --------------------------------- */}
        <div
          className="panel playlist-panel"
          style={{ flex: "1.5", display: "flex", flexDirection: "column" }}
        >
          <div
            className="view-header"
            style={{
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <h3 style={{ margin: 0 }}>مدیریت پلی‌لیست‌ها</h3>
              <span
                className="playlist-capacity"
                style={{ fontSize: "13px", color: "#888" }}
              >
                {playlists.length} / {MAX_PLAYLISTS}
              </span>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={openAddPlaylistModal}
              disabled={playlists.length >= MAX_PLAYLISTS}
            >
              <i className="fas fa-plus" /> پلی‌لیست جدید
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: "16px",
              flex: 1,
              flexDirection: "row-reverse",
            }}
          >
            {/* Sidebar برای لیست پلی‌لیست‌ها */}
            <div
              style={{
                width: "35%",
                borderRight: "1px solid #333",
                paddingRight: "12px",
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
                  onClick={async () => {
                    try {
                      await activatePlaylist(pl.id);

                      setSelectedPlaylistId(pl.id);

                      setPlaylists((prev) =>
                        prev.map((x) => ({
                          ...x,
                          isActive: x.id === pl.id,
                        })),
                      );

                      await refreshPlaylist(pl.id);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  <span
                    title={pl.name || "پلی‌لیست"} // Shows full name on hover
                    style={{
                      fontWeight:
                        selectedPlaylistId === pl.id ? "bold" : "normal",
                      color:
                        selectedPlaylistId === pl.id ? "#ff9800" : "inherit",
                      // Truncation styles:
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      flex: 1, // Allows the span to take up available space
                      minWidth: 0, // Critical for truncation inside a flexbox
                      marginInlineEnd: "10px", // Adds space between the text and buttons
                    }}
                  >
                    {pl.title || pl.name || "پلی‌لیست"}
                  </span>
                  <span
                    className="playlist-capacity"
                    style={{ fontSize: "13px", color: "#888" }}
                  >
                    {pl.tracks}
                  </span>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
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
                      style={{
                        width: 24,
                        height: 24,
                        padding: 0,
                        opacity: pl.isActive ? 0.4 : 1,
                        cursor: pl.isActive ? "not-allowed" : "pointer",
                      }}
                      disabled={pl.isActive}
                      title={
                        pl.isActive
                          ? "پلی‌لیست فعال قابل حذف نیست"
                          : "حذف پلی‌لیست"
                      }
                      onClick={(e) => {
                        e.stopPropagation();

                        if (pl.isActive) return;

                        handleDeletePlaylist(pl.id);
                      }}
                    >
                      <i className="fas fa-trash" style={{ fontSize: 10 }} />
                    </button>
                  </div>
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
                  maxHeight: "400px",
                  paddingRight: "8px",
                }}
              >
                {/* {loadingPlaylist && (
                  <div className="empty-hint">در حال دریافت...</div>
                )} */}
                {!loadingPlaylist && filteredPlaylistTracks.length === 0 && (
                  <div className="empty-hint">آهنگی یافت نشد</div>
                )}

                {filteredPlaylistTracks.map((s, index) => {
                  const isTrackPlaying = playingPlaylistTrackId === s.id;
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

                        <div
                          style={{
                            position: "relative",
                            width: 48,
                            height: 48,
                            borderRadius: 8,
                            overflow: "hidden",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            playPlaylistTrack(s.id, s.musicTrackId)
                          }
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
                            {s.artist} • {formatDuration(s.duration)}
                          </span>
                        </div>
                      </div>

                      <div
                        className="row-actions"
                        style={{ display: "flex", gap: "4px" }}
                      >
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

      {/* ------------------------------------------------------------------
      ----------------------------------------------------------------------
      -------------------------------MODALS---------------------------------
      ----------------------------------------------------------------------
      -------------------------------------------------------------------*/}

      {/* ---------------------------------
          مودال تایید حذف پلی‌لیست
      --------------------------------- */}
      {showDeleteModal && (
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
              textAlign: "center",
            }}
          >
            <h4 style={{ margin: "0 0 16px 0", color: "#fff" }}>
              حذف پلی‌لیست
            </h4>
            <p
              style={{
                color: "#ccc",
                marginBottom: "24px",
                fontSize: "14px",
              }}
            >
              آیا از حذف این پلی‌لیست اطمینان دارید؟
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setPlaylistToDelete(null);
                }}
              >
                خیر
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDeletePlaylist}
                style={{
                  background: "#f44336",
                  color: "#fff",
                  border: "none",
                }}
              >
                بله، حذف شود
              </button>
            </div>
          </div>
        </div>
      )}
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

      {/* ---------------------------------
          مودال ویرایش نام آهنگ
      --------------------------------- */}
      {showTrackModal && (
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
              ویرایش نام آهنگ
            </h4>
            <form onSubmit={submitTrackModal}>
              <input
                type="text"
                value={trackFormName}
                onChange={(e) => setTrackFormName(e.target.value)}
                placeholder="نام جدید آهنگ را وارد کنید..."
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
                  onClick={() => setShowTrackModal(false)}
                >
                  لغو
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!trackFormName.trim()}
                >
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ---------------------------------
          مودال پیش نمایش آهنگ
      --------------------------------- */}
      {showPreviewModal && (
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
              width: "420px",
              border: "1px solid #444",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  color: "#fff",
                }}
              >
                پیش‌نمایش آهنگ
              </h4>

              <button className="btn btn-secondary" onClick={closePreviewModal}>
                ✕
              </button>
            </div>

            <div
              style={{
                color: "#ff9800",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              {previewTrackTitle}
            </div>

            <input
              type="range"
              min="0"
              max={previewDuration || 0}
              value={previewCurrentTime}
              onChange={handlePreviewSeek}
              style={{
                width: "100%",
                accentColor: "#ff9800",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "8px",
                color: "#aaa",
                fontSize: "12px",
                direction: "ltr",
              }}
            >
              <span>{formatTime(previewCurrentTime)}</span>
              <span>{formatTime(previewDuration)}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                className="btn btn-primary"
                onClick={async () => {
                  if (previewAudioRef.current.paused) {
                    await previewAudioRef.current.play();
                    setIsPreviewPlaying(true);
                  } else {
                    previewAudioRef.current.pause();
                    setIsPreviewPlaying(false);
                  }
                }}
              >
                <i
                  className={isPreviewPlaying ? "fas fa-pause" : "fas fa-play"}
                />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ---------------------------------
          مودال هشدار
      --------------------------------- */}
      {!!alertMessage && (
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
              textAlign: "center",
            }}
          >
            <h4 style={{ margin: "0 0 16px 0", color: "#fff" }}>پیام</h4>
            <p
              style={{
                color: "#ccc",
                marginBottom: "24px",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              {alertMessage}
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setAlertMessage("")}
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
