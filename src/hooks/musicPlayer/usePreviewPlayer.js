// src/hooks/musicPlayer/usePreviewPlayer.js
import { useEffect, useRef, useState } from "react";
import { useGlobalUI } from "../../components/common/GlobalUI";
import { getTrack } from "../../api/music";
import { withAuthToken } from "../../utils/musicFormatters";

/**
 * منطق مودال پیش‌نمایش آهنگ (پخش مستقل قبل از افزودن به پلی‌لیست).
 *
 * tracks: آرایه‌ی آرشیو، فقط برای نمایش عنوان آهنگ لازم است (خواندنی).
 * audioCacheRef: کش مشترک audioUrl که بین پلیر اصلی و پیش‌نمایش
 *   به اشتراک گذاشته می‌شود، تا هر دو یک نسخه از URLها را استفاده کنند.
 * onBeforePreviewStart: قبل از شروع پخش پیش‌نمایش صدا زده می‌شود، تا
 *   کامپوننت والد در صورت نیاز پلیر اصلی را متوقف کند (چون این hook
 *   خودش از وضعیت پلیر اصلی بی‌خبر است).
 */
export default function usePreviewPlayer({
  tracks,
  audioCacheRef,
  onBeforePreviewStart,
}) {
  const { notify } = useGlobalUI();

  const previewAudioRef = useRef(new Audio());
  const isPreviewSeekingRef = useRef(false);

  const [previewTrackId, setPreviewTrackId] = useState(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTrackTitle, setPreviewTrackTitle] = useState("");
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);

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
        notify({ type: "error", message: "فایل صوتی یافت نشد" });
        return;
      }

      // پخش آهنگ جدید
      previewAudioRef.current.pause();
      previewAudioRef.current.src = withAuthToken(audioUrl);

      // قبل از پخش پیش‌نمایش، پلیر اصلی را متوقف کن (اگر در حال پخش است)
      if (onBeforePreviewStart) {
        onBeforePreviewStart();
      }

      await previewAudioRef.current.play();

      setPreviewTrackId(musicTrackId);
      setPreviewTrackTitle(track?.title ?? "پیش‌نمایش آهنگ");

      setShowPreviewModal(true);
      setIsPreviewPlaying(true);
    } catch (err) {
      console.error(err);
      notify({ type: "error", message: "خطا در پخش موسیقی" });
    }
  };

  useEffect(() => {
    const audio = previewAudioRef.current;

    const onTimeUpdate = () => {
      if (!isPreviewSeekingRef.current) {
        setPreviewCurrentTime(audio.currentTime);
      }
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

  const closePreviewModal = () => {
    previewAudioRef.current.pause();

    setShowPreviewModal(false);
    setPreviewTrackId(null);
    setIsPreviewPlaying(false);

    setPreviewCurrentTime(0);
    setPreviewDuration(0);
  };

  const togglePreviewPlay = async () => {
    if (previewAudioRef.current.paused) {
      await previewAudioRef.current.play();
      setIsPreviewPlaying(true);
    } else {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    }
  };

  const handlePreviewSeekMouseDown = () => {
    isPreviewSeekingRef.current = true;
  };
  const handlePreviewSeekChange = (e) => {
    setPreviewCurrentTime(Number(e.target.value));
  };
  const handlePreviewSeekMouseUp = (e) => {
    const value = Number(e.target.value);
    if (previewAudioRef.current) {
      previewAudioRef.current.currentTime = value;
    }
    isPreviewSeekingRef.current = false;
  };

  const previewProgressPct = previewDuration
    ? (previewCurrentTime / previewDuration) * 100
    : 0;

  return {
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
  };
}
