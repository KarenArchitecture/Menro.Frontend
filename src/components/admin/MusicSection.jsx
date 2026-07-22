import React, { useEffect, useMemo, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import ownerRestaurantAxios from "../../api/ownerRestaurantAxios";
import { useMusicSignalR } from "../../hooks/useMusicSignalR";
import { useModal } from "../common/GlobalModal";
// import "./MusicSection.css";

// for api
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

  const withAuthToken = (url) => {
    if (!url) return url;
    const token = localStorage.getItem("accessToken");
    if (!token) return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}access_token=${encodeURIComponent(token)}`;
  };

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

  /* --- REAL-TIME PROPS --- */
  const { user } = useAuth();
  const { showModal } = useModal();
  const [restaurantId, setRestaurantId] = useState(null);
  //--restaurant context
  useEffect(() => {
    const loadRestaurantContext = async () => {
      try {
        const { data } = await ownerRestaurantAxios.get("/context");
        setRestaurantId(data.restaurantId);
      } catch (err) {
        console.error("restaurant context error:", err);
      }
    };

    if (user) {
      loadRestaurantContext();
    }
  }, [user]);
  //--SignalR
  useMusicSignalR(restaurantId, {
    onCreated: async () => {
      showModal({
        title: "درخواست جدید موسیقی",
        message: "یک درخواست جدید موسیقی از طرف مشتری ثبت شده است.",
        buttonText: "متوجه شدم",
      });

      await fetchTrackRequests();

      console.log("🔄 music requests refreshed");
    },
    onPlaybackChanged: async (playerDto) => {
      await handlePlaybackChanged(playerDto);
    },
  });
  //--handler for player state auto refresh
  const handlePlaybackChanged = async (playerDto) => {
    try {
      // sync state with backend
      setPlayerState(playerDto);

      // if track = null
      if (!playerDto?.currentTrackId) {
        audioRef.current?.pause();

        setPlayingTrackId(null);
        setPlayingPlaylistTrackId(null);
        setIsPlaying(false);
        setCurrentTime(0);

        return;
      }
      const tracks = await refreshPlaylist(selectedPlaylistIdRef.current);
      const nextTrack = tracks?.find((x) => x.id === playerDto.currentTrackId);

      if (!nextTrack) return;

      await playTrack(nextTrack);
    } catch (err) {
      console.error(err);
    }
  };

  /* --- FETCH DATA --- */
  //--fetch player
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

      if (player?.currentTrackId) {
        const currentTrack = tracks.find((x) => x.id === player.currentTrackId);

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
  //--fetch playlist/
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
        isRequestedTrack: t.isRequestedTrack,
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

  // add track to playlist
  const addToPlaylist = async (track) => {
    if (!selectedPlaylistId) return;
    try {
      await addTrackToPlaylist(selectedPlaylistId, { musicTrackId: track.id });
      await refreshPlaylist(selectedPlaylistId);
    } catch (err) {
      console.error(err);
    }
  };

  /* --- DELETIONS --- */
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

  // -------------------------
  // MODALS
  // -------------------------
  //--archive track modal
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
  //--Playlist Modal
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
  // Handlers / Helpers
  // -------------------------
  // upload track handler
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

  // playlist/archive search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearching(true);
    setTimeout(() => setSearching(false), 250);
  };
  // dummy online search!
  const handleOnlineSearch = (e) => {
    e.preventDefault();
    if (!searchUrl.trim()) {
      setAlertMessage("لطفا لینک را وارد کنید.");
      return;
    }
    setAlertMessage(`در حال جستجوی لینک: ${searchUrl}`);
    setSearchUrl("");
  };

  /* ARCHIVE TRACK PREVIEW */
  //--playing track preview from archive
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
      previewAudioRef.current.src = withAuthToken(audioUrl);

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

  /* ----- PLAYER ENGINE ----- */
  //--get current track *****
  const getCurrentTrack = () => {
    return (
      playlistTracks.find((x) => x.id === playingPlaylistTrackIdRef.current) ||
      playlistTracks[0] ||
      null
    );
  };
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
  //--toggle global play
  const toggleGlobalPlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    const currentTrack = getCurrentTrack();

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

      audio.src = withAuthToken(audioUrl);

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
    return playlistTracks.findIndex(
      (x) => x.id === playingPlaylistTrackIdRef.current,
    );
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
    audio.src = withAuthToken(url);
    audio.load();

    await new Promise((r) => requestAnimationFrame(r));

    return true;
  };
  //--play selected track
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
  //--seek helpers
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

  /* ----- purely visual derived values (no logic impact) ----- */
  const nowPlayingTrack = playlistTracks.find(
    (t) => t.id === playingPlaylistTrackId,
  );
  const mainProgressPct = duration ? (currentTime / duration) * 100 : 0;
  const previewProgressPct = previewDuration
    ? (previewCurrentTime / previewDuration) * 100
    : 0;

  return (
    <div className="music-hub" dir="rtl">
      {/* ---------------------------------
          Now Playing bar
      --------------------------------- */}
      <div className="player-bar">
        <div className="player-bar__art-wrap">
          <div className={`player-bar__art ${isPlaying ? "is-spinning" : ""}`}>
            {nowPlayingTrack?.artworkUrl ? (
              <img src={nowPlayingTrack.artworkUrl} alt="" />
            ) : (
              <span className="player-bar__art-hole" />
            )}
          </div>
        </div>

        <div className="player-bar__controls">
          <button
            className="player-btn player-btn--ghost"
            title="قبلی"
            onClick={playPreviousTrack}
          >
            <i className="fas fa-step-backward" />
          </button>

          <button
            type="button"
            className="player-btn player-btn--main"
            onClick={toggleGlobalPlay}
          >
            <i className={isPlaying ? "fas fa-pause" : "fas fa-play"} />
          </button>

          <button
            className="player-btn player-btn--ghost"
            title="بعدی"
            onClick={playNextTrack}
          >
            <i className="fas fa-step-forward" />
          </button>
        </div>

        <div className="player-bar__meta">
          <div className="player-bar__track-row">
            <span
              className={`player-bar__title ${nowPlayingTrack ? "" : "is-idle"}`}
            >
              {nowPlayingTrack?.title || "آهنگی در حال پخش نیست"}
            </span>
            <span className="player-bar__time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="player-bar__progress">
            <div
              className="player-bar__progress-fill"
              style={{ width: `${mainProgressPct}%` }}
            />
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
            />
          </div>
        </div>
      </div>

      <div className="music-columns">
        {/* ---------------------------------
            آرشیو موسیقی
        --------------------------------- */}
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
                            onClick={() => handlePreviewTrack(r.id, r.audioUrl)}
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
                            onClick={() => openEditTrackModal(r.id, r.title)}
                            className="mh-icon-btn"
                            title="ویرایش نام"
                          >
                            <i className="fas fa-pencil-alt" />
                          </button>

                          <button
                            onClick={() => addToPlaylist(r)}
                            className="mh-icon-btn"
                            title="افزودن به پلی‌لیست"
                          >
                            <i className="fas fa-plus" />
                          </button>

                          <button
                            onClick={() => deleteTrackFromArchive(r.id)}
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

        {/* ---------------------------------
            پلی‌لیست ادمین
        --------------------------------- */}
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
              onClick={openAddPlaylistModal}
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
                        openEditPlaylistModal(pl);
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
              <input
                type="text"
                className="mh-input"
                placeholder="جستجو در این پلی‌لیست..."
                value={playlistQuery}
                onChange={(e) => setPlaylistQuery(e.target.value)}
              />

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
                            onClick={() => movePlaylistTrack(index, "up")}
                          >
                            <i className="fas fa-chevron-up" />
                          </button>
                          <button
                            disabled={
                              index === filteredPlaylistTracks.length - 1
                            }
                            onClick={() => movePlaylistTrack(index, "down")}
                          >
                            <i className="fas fa-chevron-down" />
                          </button>
                        </div>

                        <div
                          className="mh-art"
                          onClick={() =>
                            playPlaylistTrack(s.id, s.musicTrackId)
                          }
                        >
                          {s.artworkUrl ? (
                            <img src={s.artworkUrl} alt="" />
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
                              <span className="mh-chip-requested">
                                درخواستی
                              </span>
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
                          onClick={() => removeFromPlaylist(s.id)}
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
      </div>

      {/* ---------------------------------
          آهنگ‌های درخواستی
      --------------------------------- */}
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
              onClick={fetchTrackRequests}
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
                    onClick={() => handleApproveRequest(track)}
                  >
                    <i className="fas fa-check" /> تایید
                  </button>
                  <button
                    type="button"
                    className="mh-btn mh-btn--reject"
                    onClick={() => handleRejectRequest(track.id)}
                  >
                    <i className="fas fa-times" /> رد
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------
      -------------------------------MODALS---------------------------------
      -------------------------------------------------------------------*/}

      {/* مودال تایید حذف پلی‌لیست */}
      {showDeleteModal && (
        <div className="mh-modal-backdrop">
          <div className="mh-modal">
            <h4
              className="mh-modal__title"
              style={{ justifyContent: "center" }}
            >
              حذف پلی‌لیست
            </h4>
            <p className="mh-modal__text">
              آیا از حذف این پلی‌لیست اطمینان دارید؟
            </p>
            <div className="mh-modal__footer is-center">
              <button
                type="button"
                className="mh-btn mh-btn--ghost"
                onClick={() => {
                  setShowDeleteModal(false);
                  setPlaylistToDelete(null);
                }}
              >
                خیر
              </button>
              <button
                type="button"
                className="mh-btn mh-btn--reject"
                onClick={handleConfirmDeletePlaylist}
                disabled={deleting}
              >
                بله، حذف شود
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال ساخت/ویرایش پلی‌لیست */}
      {showPlaylistModal && (
        <div className="mh-modal-backdrop">
          <div className="mh-modal">
            <h4 className="mh-modal__title">
              {playlistModalMode === "add"
                ? "ایجاد پلی‌لیست جدید"
                : "ویرایش پلی‌لیست"}
            </h4>
            <form onSubmit={submitPlaylistModal}>
              <input
                type="text"
                className="mh-input"
                value={playlistFormName}
                onChange={(e) => setPlaylistFormName(e.target.value)}
                placeholder="نام پلی‌لیست را وارد کنید..."
                autoFocus
              />
              <div className="mh-modal__footer">
                <button
                  type="button"
                  className="mh-btn mh-btn--ghost"
                  onClick={() => setShowPlaylistModal(false)}
                >
                  لغو
                </button>
                <button
                  type="submit"
                  className="mh-btn mh-btn--primary"
                  disabled={!playlistFormName.trim()}
                >
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال ویرایش نام آهنگ */}
      {showTrackModal && (
        <div className="mh-modal-backdrop">
          <div className="mh-modal">
            <h4 className="mh-modal__title">ویرایش نام آهنگ</h4>
            <form onSubmit={submitTrackModal}>
              <input
                type="text"
                className="mh-input"
                value={trackFormName}
                onChange={(e) => setTrackFormName(e.target.value)}
                placeholder="نام جدید آهنگ را وارد کنید..."
                autoFocus
              />
              <div className="mh-modal__footer">
                <button
                  type="button"
                  className="mh-btn mh-btn--ghost"
                  onClick={() => setShowTrackModal(false)}
                >
                  لغو
                </button>
                <button
                  type="submit"
                  className="mh-btn mh-btn--primary"
                  disabled={!trackFormName.trim()}
                >
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال پیش نمایش آهنگ */}
      {showPreviewModal && (
        <div className="mh-modal-backdrop">
          <div className="mh-modal mh-modal--wide">
            <h4 className="mh-modal__title">
              پیش‌نمایش آهنگ
              <button
                className="mh-icon-btn"
                onClick={closePreviewModal}
                title="بستن"
              >
                ✕
              </button>
            </h4>

            <div className="mh-preview-track">{previewTrackTitle}</div>

            <div className="mh-preview-progress">
              <div
                className="mh-preview-progress-fill"
                style={{ width: `${previewProgressPct}%` }}
              />
              <input
                type="range"
                min="0"
                max={previewDuration || 0}
                value={previewCurrentTime}
                onChange={handlePreviewSeek}
              />
            </div>

            <div className="mh-preview-time">
              <span>{formatTime(previewCurrentTime)}</span>
              <span>{formatTime(previewDuration)}</span>
            </div>

            <div className="mh-preview-playbtn">
              <button
                type="button"
                className="player-btn player-btn--main"
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

      {/* مودال هشدار */}
      {!!alertMessage && (
        <div className="mh-modal-backdrop">
          <div className="mh-modal">
            <h4
              className="mh-modal__title"
              style={{ justifyContent: "center" }}
            >
              پیام
            </h4>
            <p className="mh-modal__text">{alertMessage}</p>
            <div className="mh-modal__footer is-center">
              <button
                type="button"
                className="mh-btn mh-btn--primary"
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
