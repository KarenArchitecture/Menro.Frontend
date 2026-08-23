import React, { useEffect, useMemo, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import ownerRestaurantAxios from "../../api/ownerRestaurantAxios";
import { useMusicSignalR } from "../../hooks/useMusicSignalR";
import { useGlobalUI } from "../common/GlobalUI";
import useDocumentTitle from "../../hooks/useDocumentTitle";

import NowPlayingBar from "../musicPlayer/NowPlayingBar";
import MusicArchiveCard from "../musicPlayer/MusicArchiveCard";
import PlaylistCard from "../musicPlayer/PlaylistCard";
import TrackRequestsCard from "../musicPlayer/TrackRequestsCard";

import PlaylistFormModal from "../musicPlayer/PlaylistFormModal";
import TrackFormModal from "../musicPlayer/TrackFormModal";
import PreviewModal from "../musicPlayer/PreviewModal";

// music player hooks import
import useTrackRequests from "../../hooks/musicPlayer/useTrackRequests";
import usePreviewPlayer from "../../hooks/musicPlayer/usePreviewPlayer";
import useMusicArchive from "../../hooks/musicPlayer/useMusicArchive";

import "../../assets/css/admin/musicSection.css";

import {
  MAX_TRACKS,
  MAX_PLAYLISTS,
  formatTime,
  formatDuration,
  withAuthToken,
} from "../../utils/musicFormatters";

// for api
import {
  getTrack,
  createPlaylist,
  getPlaylists,
  getPlaylist,
  renamePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  activatePlaylist,
  deletePlaylist,
  reorderPlaylistTrack,
  setCurrentTrack,
  advanceTrack,
  previousTrack,
  getPlayerState,
} from "../../api/music";

export default function MusicSection() {
  useDocumentTitle("پخش‌کننده موسیقی");
  /* -------------------------------------------------------------------
     STATE
  ------------------------------------------------------------------- */
  // tabs / archive / playlists
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const selectedPlaylistIdRef = useRef(selectedPlaylistId);

  useEffect(() => {
    selectedPlaylistIdRef.current = selectedPlaylistId;
  }, [selectedPlaylistId]);

  // playing track (from playlist)
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [playingPlaylistTrackId, setPlayingPlaylistTrackId] = useState(null);

  // Modal state: ساخت/ویرایش پلی‌لیست (فرم اختصاصی، خارج از GlobalUI)
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlistModalMode, setPlaylistModalMode] = useState("add");
  const [playlistFormName, setPlaylistFormName] = useState("");
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);

  // Playing music (main player from playlist)
  const audioRef = useRef(null);
  const audioCacheRef = useRef({});
  const isSeekingRef = useRef(false);
  const [playerState, setPlayerState] = useState(null);

  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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

  /* --- REAL-TIME PROPS --- */
  const { user } = useAuth();
  const { notify, alertModal, confirmModal } = useGlobalUI();
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
  useMusicSignalR(restaurantId, "admin", {
    onCreated: async () => {
      await alertModal({
        title: "درخواست جدید موسیقی",
        message: "یک درخواست جدید موسیقی از طرف مشتری ثبت شده است.",
        buttonText: "متوجه شدم",
      });

      await fetchTrackRequests();
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
  const {
    tracks,
    loadingArchive,
    onUploadFiles,
    deleteTrackFromArchive,
    showTrackModal,
    trackFormName,
    setTrackFormName,
    openEditTrackModal,
    submitTrackModal,
    closeTrackModal,
  } = useMusicArchive({
    onTrackDeleted: (trackId) => {
      setPlaylistTracks((prev) =>
        prev.filter((p) => p.musicTrackId !== trackId),
      );
    },
    onTrackRenamed: async () => {
      if (selectedPlaylistId) {
        await refreshPlaylist(selectedPlaylistId);
      }
    },
  });
  const {
    showPreviewModal,
    previewTrackTitle,
    isPreviewPlaying,
    previewCurrentTime,
    previewDuration,
    previewProgressPct,
    handlePreviewTrack,
    closePreviewModal,
    togglePreviewPlay,
    handlePreviewSeekMouseDown,
    handlePreviewSeekChange,
    handlePreviewSeekMouseUp,
  } = usePreviewPlayer({
    tracks,
    audioCacheRef,
    onBeforePreviewStart: () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    },
  });

  /* -------------------------------------------------------------------
     FETCH DATA
  ------------------------------------------------------------------- */
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
      notify({ type: "error", message: "دریافت پلی‌لیست‌ها با خطا مواجه شد" });
    }
  };
  useEffect(() => {
    loadPlaylists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        isRequestedTrack: t.isRequestedTrack,
        source: "playlist",
      }));

      setPlaylistTracks(mapped);

      return mapped;
    } catch (err) {
      console.error(err);
      notify({ type: "error", message: "دریافت پلی‌لیست با خطا مواجه شد" });
      return [];
    } finally {
      setLoadingPlaylist(false);
    }
  };
  const {
    requestedTracks,
    loadingRequests,
    fetchTrackRequests,
    handleApproveRequest,
    handleRejectRequest,
  } = useTrackRequests({
    onApproved: async () => {
      if (selectedPlaylistId) {
        await refreshPlaylist(selectedPlaylistId);
      }
    },
  });
  useEffect(() => {
    if (!selectedPlaylistId) return;
    refreshPlaylist(selectedPlaylistId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlaylistId]);

  // add track to playlist
  const addToPlaylist = async (track) => {
    if (!selectedPlaylistId) return;
    try {
      await addTrackToPlaylist(selectedPlaylistId, { musicTrackId: track.id });
      await refreshPlaylist(selectedPlaylistId);
      notify({ type: "success", message: "آهنگ به پلی‌لیست اضافه شد" });
    } catch (err) {
      console.error(err);
      notify({ type: "error", message: "افزودن آهنگ به پلی‌لیست ناموفق بود" });
    }
  };

  /* -------------------------------------------------------------------
     DELETIONS / MUTATIONS THAT NEED CONFIRMATION
  ------------------------------------------------------------------- */
  // remove playlist (entity حذف => تایید سراسری)
  const handleDeletePlaylist = async (id) => {
    const confirmed = await confirmModal({
      title: "حذف پلی‌لیست",
      message:
        "آیا از حذف این پلی‌لیست اطمینان دارید؟ این عملیات قابل بازگشت نیست.",
      confirmText: "بله، حذف شود",
      cancelText: "خیر",
      danger: true,
    });

    if (!confirmed) return;

    try {
      await deletePlaylist(id);

      notify({ type: "success", message: "پلی‌لیست با موفقیت حذف شد" });

      await loadPlaylists();

      // اگر پلی‌لیست فعال حذف شد
      if (selectedPlaylistId === id) {
        setSelectedPlaylistId(null);
        setPlaylistTracks([]);
      }
    } catch (err) {
      console.error(err);
      notify({ type: "error", message: "حذف پلی‌لیست انجام نشد" });
    }
  };
  // remove track from playlist (اکشن مهم/غیرقابل‌برگشت روی پخش زنده => تایید سراسری)
  const removeFromPlaylist = async (playlistTrackId) => {
    if (!selectedPlaylistId) return;

    // const confirmed = await confirmModal({
    //   title: "حذف از پلی‌لیست",
    //   message: "این آهنگ از پلی‌لیست حذف خواهد شد. ادامه می‌دهید؟",
    //   confirmText: "بله، حذف شود",
    //   cancelText: "خیر",
    //   danger: true,
    // });

    // if (!confirmed) return;

    try {
      const oldTracks = [...playlistTracksRef.current];

      const removedIndex = oldTracks.findIndex((x) => x.id === playlistTrackId);

      const isCurrentlyPlaying =
        playlistTrackId === playingPlaylistTrackIdRef.current;

      await removeTrackFromPlaylist(selectedPlaylistId, playlistTrackId);

      // لیست جدید را مستقیم بگیر
      const updatedTracks = await refreshPlaylist(selectedPlaylistId);

      notify({ type: "success", message: "آهنگ از پلی‌لیست حذف شد" });

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
      notify({ type: "error", message: "حذف از پلی‌لیست ناموفق بود" });
    }
  };

  /* -------------------------------------------------------------------
     FORM MODALS (ساخت/ویرایش پلی‌لیست و آهنگ — خارج از GlobalUI)
  ------------------------------------------------------------------- */
  //--Playlist Modal
  const openAddPlaylistModal = () => {
    if (playlists.length >= MAX_PLAYLISTS) {
      notify({ type: "warning", message: "ظرفیت ساخت پلی‌لیست پر شده است." });
      return;
    }
    setPlaylistModalMode("add");
    setPlaylistFormName("");
    setShowPlaylistModal(true);
  };
  const handleSelectPlaylist = async (playlistId) => {
    try {
      await activatePlaylist(playlistId);
      setSelectedPlaylistId(playlistId);
      setPlaylists((prev) =>
        prev.map((x) => ({ ...x, isActive: x.id === playlistId })),
      );
      await refreshPlaylist(playlistId);
    } catch (err) {
      console.error(err);
      notify({ type: "error", message: "فعال‌سازی پلی‌لیست ناموفق بود" });
    }
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

        notify({
          type: "success",
          message: "پلی‌لیست جدید با موفقیت ساخته شد",
        });
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

        notify({ type: "success", message: "پلی‌لیست با موفقیت ویرایش شد" });
      }

      setPlaylistFormName("");
      setEditingPlaylistId(null);
      setShowPlaylistModal(false);
    } catch (err) {
      console.error(err);

      notify({
        type: "error",
        message:
          err?.response?.data?.message ??
          (playlistModalMode === "add"
            ? "خطا در ساخت پلی‌لیست"
            : "خطا در ذخیره پلی‌لیست"),
      });
    }
  };

  /* -------------------------------------------------------------------
     HANDLERS / HELPERS
  ------------------------------------------------------------------- */
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
      const tracks = playlistTracksRef.current;
      const currentId = playingPlaylistTrackIdRef.current;

      const currentIndex = tracks.findIndex((x) => x.id === currentId);

      if (currentIndex === -1) return;

      const nextTrack = tracks[currentIndex + 1];

      if (!nextTrack) return;

      try {
        await syncAndPlay(nextTrack, "next");

        // اجبار به هماهنگی UI پس از پایان آهنگ
        if (selectedPlaylistIdRef.current) {
          await refreshPlaylist(selectedPlaylistIdRef.current);
        }
      } catch (err) {
        console.error(err);
        notify({ type: "error", message: "پخش آهنگ بعدی با خطا مواجه شد" });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      } catch (err) {
        console.error(err);
        notify({ type: "error", message: "پخش موسیقی ناموفق بود" });
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
        p.catch((err) => {
          console.error("PLAY FAILED:", err);
        });
      }

      setPlayingPlaylistTrackId(playlistTrackId);
      setPlayingTrackId(musicTrackId);
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
      notify({ type: "error", message: "پخش آهنگ ناموفق بود" });
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
  //--current index of playlist track
  const getCurrentPlaylistTrackIndex = () => {
    return playlistTracks.findIndex(
      (x) => x.id === playingPlaylistTrackIdRef.current,
    );
  };
  //--play next track from playlist
  const playNextTrack = async () => {
    try {
      const currentIndex = getCurrentPlaylistTrackIndex();

      if (currentIndex === -1) {
        const firstTrack = playlistTracks?.[0];
        await syncAndPlay(firstTrack, "next");
        return;
      }

      const nextTrack = playlistTracks[currentIndex + 1];

      if (!nextTrack) return;

      await syncAndPlay(nextTrack, "next");
    } catch (err) {
      console.error(err);
      notify({ type: "error", message: "پخش آهنگ بعدی ناموفق بود" });
    }
  };
  //--play previous track from playlist
  const playPreviousTrack = async () => {
    try {
      const currentIndex = getCurrentPlaylistTrackIndex();

      if (currentIndex <= 0) return;

      const previousTrackItem = playlistTracks[currentIndex - 1];

      await syncAndPlay(previousTrackItem, "prev");
    } catch (err) {
      console.error(err);
      notify({ type: "error", message: "پخش آهنگ قبلی ناموفق بود" });
    }
  };
  //--central bootstrap and audio manager
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

    try {
      const ok = await ensureTrackLoaded(track);
      if (!ok) return;

      await audioRef.current.play();
      setIsPlaying(true);
      setPlayingTrackId(track.musicTrackId);
      setPlayingPlaylistTrackId(track.id);
    } catch (err) {
      console.error("PLAY FAILED:", err);
      notify({ type: "error", message: "پخش آهنگ ناموفق بود" });
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
  const movePlaylistTrack = async (trackId, direction) => {
    try {
      await reorderPlaylistTrack(selectedPlaylistId, trackId, direction);
      await refreshPlaylist(selectedPlaylistId);
    } catch (err) {
      console.error(err);
      notify({ type: "error", message: "جابجایی آهنگ در پلی‌لیست ناموفق بود" });
    }
  };

  /* -------------------------------------------------------------------
     TRACK REQUESTS: APPROVE / REJECT
  ------------------------------------------------------------------- */
  /* ----- purely visual derived values (no logic impact) ----- */
  const nowPlayingTrack = playlistTracks.find(
    (t) => t.id === playingPlaylistTrackId,
  );
  const mainProgressPct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="music-hub" dir="rtl">
      {/* ---------------------------------
          Now Playing bar
      --------------------------------- */}
      <NowPlayingBar
        nowPlayingTrack={nowPlayingTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        mainProgressPct={mainProgressPct}
        onTogglePlay={toggleGlobalPlay}
        onNext={playNextTrack}
        onPrevious={playPreviousTrack}
        onSeekMouseDown={handleSeekMouseDown}
        onSeekChange={handleSeekChange}
        onSeekMouseUp={handleSeekMouseUp}
      />

      <div className="music-columns">
        {/* ---------------------------------
            آرشیو موسیقی
        --------------------------------- */}
        <MusicArchiveCard
          tracks={tracks}
          loadingArchive={loadingArchive}
          playingTrackId={playingTrackId}
          isPlaying={isPlaying}
          onUploadFiles={onUploadFiles}
          onPreviewTrack={handlePreviewTrack}
          onEditTrack={openEditTrackModal}
          onAddToPlaylist={addToPlaylist}
          onDeleteTrack={deleteTrackFromArchive}
        />

        {/* ---------------------------------
            پلی‌لیست ادمین
        --------------------------------- */}
        <PlaylistCard
          playlists={playlists}
          selectedPlaylistId={selectedPlaylistId}
          playlistTracks={playlistTracks}
          loadingPlaylist={loadingPlaylist}
          playingPlaylistTrackId={playingPlaylistTrackId}
          isPlaying={isPlaying}
          onCreatePlaylist={openAddPlaylistModal}
          onEditPlaylist={openEditPlaylistModal}
          onDeletePlaylist={handleDeletePlaylist}
          onSelectPlaylist={handleSelectPlaylist}
          onPlayTrack={playPlaylistTrack}
          onMoveTrack={movePlaylistTrack}
          onRemoveTrack={removeFromPlaylist}
        />
      </div>

      {/* ---------------------------------
          آهنگ‌های درخواستی
      --------------------------------- */}
      <TrackRequestsCard
        requestedTracks={requestedTracks}
        loadingRequests={loadingRequests}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        onRefresh={fetchTrackRequests}
      />

      {/* ------------------------------------------------------------------
      -------------------------------MODALS---------------------------------
      -------------------------------------------------------------------*/}

      {/* مودال ساخت/ویرایش پلی‌لیست (فرم اختصاصی) */}
      <PlaylistFormModal
        isOpen={showPlaylistModal}
        mode={playlistModalMode}
        name={playlistFormName}
        onNameChange={setPlaylistFormName}
        onSubmit={submitPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
      />

      {/* مودال ویرایش نام آهنگ (فرم اختصاصی) */}
      <TrackFormModal
        isOpen={showTrackModal}
        name={trackFormName}
        onNameChange={setTrackFormName}
        onSubmit={submitTrackModal}
        onClose={closeTrackModal}
      />

      {/* مودال پیش‌نمایش آهنگ (پلیر اختصاصی) */}
      <PreviewModal
        isOpen={showPreviewModal}
        trackTitle={previewTrackTitle}
        isPlaying={isPreviewPlaying}
        currentTime={previewCurrentTime}
        duration={previewDuration}
        progressPct={previewProgressPct}
        onTogglePlay={togglePreviewPlay}
        onSeekMouseDown={handlePreviewSeekMouseDown}
        onSeekChange={handlePreviewSeekChange}
        onSeekMouseUp={handlePreviewSeekMouseUp}
        onClose={closePreviewModal}
      />
    </div>
  );
}
