// src/hooks/useMusicSignalR.js
import { useEffect } from "react";
import { getMusicConnection } from "../utils/signalr";

// اطمینان از اینکه فقط یک‌بار start() صدا زده میشه و همه منتظر همون
// promise واحد می‌مونن، حتی اگه چند کامپوننت همزمان از این connection استفاده کنن
const ensureStarted = async (connection) => {
  if (connection.state === "Connected") return;

  if (!connection._musicStartPromise) {
    connection._musicStartPromise = connection.start().catch((err) => {
      connection._musicStartPromise = null; // اجازه‌ی تلاش مجدد بعدی
      throw err;
    });
  }

  await connection._musicStartPromise;
};

export function useMusicSignalR(
  restaurantId,
  {
    onCreated,
    onApproved,
    onRejected,
    onPlaybackChanged,
    onPlaylistChanged,
  } = {},
) {
  useEffect(() => {
    if (!restaurantId) return;

    const connection = getMusicConnection();

    const handleCreated = (data) => onCreated?.(data);
    const handleApproved = (data) => onApproved?.(data);
    const handleRejected = (data) => onRejected?.(data);
    const handlePlaybackChanged = (data) => onPlaybackChanged?.(data);
    const handlePlaylistChanged = () => onPlaylistChanged?.();

    let isCancelled = false;

    const start = async () => {
      try {
        await ensureStarted(connection);

        if (isCancelled) return; // کامپوننت قبل از اتمام اتصال unmount شده

        connection.on("RequestCreated", handleCreated);
        connection.on("RequestApproved", handleApproved);
        connection.on("RequestRejected", handleRejected);
        connection.on("PlaybackChanged", handlePlaybackChanged);
        connection.on("PlaylistChanged", handlePlaylistChanged);

        await connection.invoke("JoinRestaurant", restaurantId);
      } catch (err) {
        console.error("SignalR music connection failed:", err);
      }
    };

    start();

    return () => {
      isCancelled = true;

      connection.off("RequestCreated", handleCreated);
      connection.off("RequestApproved", handleApproved);
      connection.off("RequestRejected", handleRejected);
      connection.off("PlaybackChanged", handlePlaybackChanged);
      connection.off("PlaylistChanged", handlePlaylistChanged);

      if (connection.state === "Connected") {
        connection.invoke("LeaveRestaurant", restaurantId).catch(() => {});
      }
    };
  }, [
    restaurantId,
    onCreated,
    onApproved,
    onRejected,
    onPlaybackChanged,
    onPlaylistChanged,
  ]);
}
