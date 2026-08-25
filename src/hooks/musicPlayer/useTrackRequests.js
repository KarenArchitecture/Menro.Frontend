// src/hooks/musicPlayer/useTrackRequests.js
import { useState, useEffect } from "react";
import { useGlobalUI } from "../../components/common/GlobalUI";
import {
  getTrackRequests,
  approveTrackRequest,
  rejectTrackRequest,
} from "../../api/music";

/**
 * منطق «آهنگ‌های درخواستی»: دریافت (با بارگذاری خودکار در mount)،
 * تایید، و رد درخواست‌ها.
 *
 * onApproved: بعد از تایید موفق یک درخواست صدا زده می‌شود، تا کامپوننت
 * والد در صورت نیاز پلی‌لیست فعال را رفرش کند — چون این hook خودش از
 * وضعیت پلی‌لیست انتخاب‌شده بی‌خبر است.
 */
export default function useTrackRequests({ onApproved } = {}) {
  const { notify, confirmModal } = useGlobalUI();

  const [requestedTracks, setRequestedTracks] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const fetchTrackRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await getTrackRequests();
      setRequestedTracks(response.data ?? []);
    } catch (error) {
      console.error("Failed to load track requests", error);
      notify({
        type: "error",
        message: "دریافت درخواست‌های آهنگ با خطا مواجه شد",
      });
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchTrackRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApproveRequest = async (track) => {
    const previousRequests = requestedTracks;

    setRequestedTracks((prev) => prev.filter((t) => t.id !== track.id));

    try {
      await approveTrackRequest(track.id);

      if (onApproved) {
        await onApproved();
      }

      notify({
        type: "success",
        message: "درخواست تایید شد و به پلی‌لیست اضافه شد",
      });
    } catch (err) {
      console.error(err);
      setRequestedTracks(previousRequests);
      notify({ type: "error", message: "خطا در تایید درخواست" });
    }
  };

  const handleRejectRequest = async (trackId) => {
    const confirmed = await confirmModal({
      title: "رد درخواست",
      message: "آیا از رد این درخواست آهنگ اطمینان دارید؟",
      confirmText: "بله، رد شود",
      cancelText: "خیر",
      danger: true,
    });

    if (!confirmed) return;

    try {
      await rejectTrackRequest(trackId);
      setRequestedTracks((prev) => prev.filter((t) => t.id !== trackId));
      notify({ type: "success", message: "درخواست رد شد" });
    } catch (err) {
      console.error(err);
      notify({ type: "error", message: "خطا در رد درخواست" });
    }
  };

  return {
    requestedTracks,
    loadingRequests,
    fetchTrackRequests,
    handleApproveRequest,
    handleRejectRequest,
  };
}
