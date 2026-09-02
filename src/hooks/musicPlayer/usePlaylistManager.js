// src/hooks/musicPlayer/usePlaylistManager.js
import { useEffect, useRef, useState } from "react";
import { useGlobalUI } from "../../components/common/GlobalUI";
import {
  createPlaylist,
  getPlaylists,
  getPlaylist,
  renamePlaylist,
  addTrackToPlaylist,
  activatePlaylist,
  deletePlaylist,
  reorderPlaylistTrack,
} from "../../api/music";
import { MAX_PLAYLISTS } from "../../utils/musicFormatters";

/**
 * منطق مدیریت پلی‌لیست‌ها: بارگذاری، ساخت/ویرایش/حذف، انتخاب پلی‌لیست
 * فعال، افزودن آهنگ، و جابه‌جایی آهنگ‌ها.
 *
 * loadPlayerState: تابعی که وضعیت فعلی پخش را از سرور می‌گیرد (برای
 *   sync اولیه‌ی پلی‌لیست فعال با آنچه در حال پخش است).
 * onInitialPlaybackSync: بعد از بارگذاری اولیه، اگر یک آهنگ در حال پخش
 *   بود، با {playlistTrackId, musicTrackId} صدا زده می‌شود، تا والد
 *   وضعیت پلیر (که دامنه‌ی جدایی است) را همگام کند.
 *
 * توجه: removeFromPlaylist عمداً اینجا نیست، چون به‌شدت با state پلیر
 * اصلی (audioRef, isPlaying, ...) درگیر است و در مرحله‌ی جداسازی پلیر
 * اصلی بررسی خواهد شد.
 */
export default function usePlaylistManager({
  loadPlayerState,
  onInitialPlaybackSync,
} = {}) {
  const { notify, confirmModal } = useGlobalUI();

  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const selectedPlaylistIdRef = useRef(selectedPlaylistId);

  useEffect(() => {
    selectedPlaylistIdRef.current = selectedPlaylistId;
  }, [selectedPlaylistId]);

  const [playlistTracks, setPlaylistTracks] = useState([]);
  const playlistTracksRef = useRef([]);

  useEffect(() => {
    playlistTracksRef.current = playlistTracks;
  }, [playlistTracks]);

  const [loadingPlaylist, setLoadingPlaylist] = useState(false);

  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlistModalMode, setPlaylistModalMode] = useState("add");
  const [playlistFormName, setPlaylistFormName] = useState("");
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);

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
        sortOrder: t.sortOrder,
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

  const loadPlaylists = async () => {
    try {
      const [playlistRes, player] = await Promise.all([
        getPlaylists(),
        loadPlayerState ? loadPlayerState() : Promise.resolve(null),
      ]);

      const list = playlistRes.data || [];

      setPlaylists(list);

      const playlistId =
        player?.playlistId ?? list.find((x) => x.isActive)?.id ?? list?.[0]?.id;

      if (!playlistId) return;

      setSelectedPlaylistId(playlistId);

      const tracks = await refreshPlaylist(playlistId);

      if (player?.currentTrackId) {
        const currentTrack = tracks.find((x) => x.id === player.currentTrackId);

        if (currentTrack && onInitialPlaybackSync) {
          onInitialPlaybackSync({
            playlistTrackId: currentTrack.id,
            musicTrackId: currentTrack.musicTrackId,
          });
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

  useEffect(() => {
    if (!selectedPlaylistId) return;
    refreshPlaylist(selectedPlaylistId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlaylistId]);

  const addToPlaylist = async (track) => {
    if (!selectedPlaylistId) return;
    try {
      await addTrackToPlaylist(selectedPlaylistId, { musicTrackId: track.id });
      const updated = await refreshPlaylist(selectedPlaylistId);

      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === selectedPlaylistId ? { ...p, tracks: updated.length } : p,
        ),
      );

      notify({ type: "success", message: "آهنگ به پلی‌لیست اضافه شد" });
    } catch (err) {
      console.error(err);
      notify({ type: "error", message: "افزودن آهنگ به پلی‌لیست ناموفق بود" });
    }
  };

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

      if (selectedPlaylistId === id) {
        setSelectedPlaylistId(null);
        setPlaylistTracks([]);
      }
    } catch (err) {
      console.error(err);
      notify({ type: "error", message: "حذف پلی‌لیست انجام نشد" });
    }
  };

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

  const closePlaylistModal = () => setShowPlaylistModal(false);

  const submitPlaylistModal = async (e) => {
    e.preventDefault();

    const name = playlistFormName.trim();

    if (!name) return;

    try {
      if (playlistModalMode === "add") {
        const res = await createPlaylist({ name });

        const newPlaylist = {
          id: res.data.id,
          name: res.data.name,
          tracks: 0,
          isActive: true,
        };

        setPlaylists((prev) => [
          ...prev.map((p) => ({ ...p, isActive: false })),
          newPlaylist,
        ]);

        setSelectedPlaylistId(newPlaylist.id);
        setPlaylistTracks([]);

        notify({
          type: "success",
          message: "پلی‌لیست جدید با موفقیت ساخته شد",
        });
      } else {
        await renamePlaylist(editingPlaylistId, { name });

        setPlaylists((prev) =>
          prev.map((p) => (p.id === editingPlaylistId ? { ...p, name } : p)),
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

  const movePlaylistTrack = async (trackId, direction) => {
    try {
      await reorderPlaylistTrack(selectedPlaylistId, trackId, direction);
      await refreshPlaylist(selectedPlaylistId);
    } catch (err) {
      console.error(err);
      notify({ type: "error", message: "جابجایی آهنگ در پلی‌لیست ناموفق بود" });
    }
  };

  return {
    playlists,
    selectedPlaylistId,
    setSelectedPlaylistId,
    selectedPlaylistIdRef,
    playlistTracks,
    setPlaylistTracks,
    playlistTracksRef,
    loadingPlaylist,
    showPlaylistModal,
    playlistModalMode,
    playlistFormName,
    setPlaylistFormName,
    refreshPlaylist,
    loadPlaylists,
    addToPlaylist,
    setPlaylists,
    handleDeletePlaylist,
    openAddPlaylistModal,
    openEditPlaylistModal,
    closePlaylistModal,
    submitPlaylistModal,
    handleSelectPlaylist,
    movePlaylistTrack,
  };
}
