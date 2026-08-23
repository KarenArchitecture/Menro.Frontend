// src/hooks/musicPlayer/useMusicArchive.js
import { useEffect, useState } from "react";
import { useGlobalUI } from "../../components/common/GlobalUI";
import {
  getTracks,
  createTrack,
  deleteTrack,
  renameTrack,
} from "../../api/music";
import { MAX_TRACKS } from "../../utils/musicFormatters";

/**
 * منطق «آرشیو موسیقی»: دریافت، آپلود، حذف، و ویرایش نام آهنگ‌ها.
 *
 * onTrackDeleted: بعد از حذف موفق یک آهنگ از آرشیو صدا زده می‌شود، تا
 *   والد آن را از playlistTracks هم حذف کند (چون این hook از پلی‌لیست بی‌خبر است).
 * onTrackRenamed: بعد از تغییر نام موفق صدا زده می‌شود، تا والد در صورت
 *   نیاز پلی‌لیست فعال را رفرش کند.
 */
export default function useMusicArchive({ onTrackDeleted, onTrackRenamed }) {
  const { notify, confirmModal } = useGlobalUI();

  const [tracks, setTracks] = useState([]);
  const [loadingArchive, setLoadingArchive] = useState(false);

  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackFormName, setTrackFormName] = useState("");
  const [editingTrackId, setEditingTrackId] = useState(null);

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
      notify({ type: "error", message: "دریافت آرشیو موسیقی با خطا مواجه شد" });
    } finally {
      setLoadingArchive(false);
    }
  };

  useEffect(() => {
    loadTracks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onUploadFiles = async (files) => {
    if (!files?.length) return;
    let audioFiles = Array.from(files).filter((f) =>
      f.type.startsWith("audio/"),
    );
    if (!audioFiles.length) return;

    const remainingCapacity = MAX_TRACKS - tracks.length;
    if (audioFiles.length > remainingCapacity) {
      notify({
        type: "warning",
        message: `ظرفیت آرشیو محدود است. فقط ${remainingCapacity} فایل دیگر مجاز است.`,
      });
      audioFiles = audioFiles.slice(0, remainingCapacity);
      if (!audioFiles.length) return;
    }

    let successCount = 0;

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
        successCount += 1;
      } catch (err) {
        console.error(err);
        notify({ type: "error", message: `خطا در آپلود فایل «${file.name}»` });
      }
    }

    if (successCount > 0) {
      notify({
        type: "success",
        message:
          successCount === 1
            ? "آهنگ با موفقیت بارگذاری شد"
            : `${successCount} آهنگ با موفقیت بارگذاری شد`,
      });
    }
  };

  const deleteTrackFromArchive = async (id) => {
    const confirmed = await confirmModal({
      title: "حذف آهنگ",
      message:
        "آیا از حذف این آهنگ از آرشیو اطمینان دارید؟ این عملیات قابل بازگشت نیست.",
      confirmText: "بله، حذف شود",
      cancelText: "خیر",
      danger: true,
    });

    if (!confirmed) return;

    const backup = tracks.find((t) => t.id === id);
    setTracks((prev) => prev.filter((t) => t.id !== id));

    try {
      await deleteTrack(id);

      if (onTrackDeleted) {
        onTrackDeleted(id);
      }

      notify({ type: "success", message: "آهنگ با موفقیت از آرشیو حذف شد" });
    } catch (err) {
      console.error(err);
      setTracks((prev) => [...prev, backup]);
      notify({ type: "error", message: "حذف ناموفق بود" });
    }
  };

  const openEditTrackModal = (trackId, currentTitle) => {
    setEditingTrackId(trackId);
    setTrackFormName(currentTitle || "");
    setShowTrackModal(true);
  };

  const closeTrackModal = () => setShowTrackModal(false);

  const submitTrackModal = async (e) => {
    e.preventDefault();

    const title = trackFormName.trim();

    if (!title) return;

    try {
      await renameTrack(editingTrackId, { title });

      setTracks((prev) =>
        prev.map((t) => (t.id === editingTrackId ? { ...t, title } : t)),
      );

      if (onTrackRenamed) {
        await onTrackRenamed();
      }

      notify({ type: "success", message: "نام آهنگ با موفقیت تغییر کرد" });

      setShowTrackModal(false);
      setTrackFormName("");
      setEditingTrackId(null);
    } catch (err) {
      console.error(err);
      notify({
        type: "error",
        message: err?.response?.data?.message ?? "خطا در تغییر نام آهنگ",
      });
    }
  };

  return {
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
  };
}
