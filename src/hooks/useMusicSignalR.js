// src/hooks/useMusicSignalR.js
import { useEffect } from "react";
import { getMusicConnection } from "../utils/signalr";

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

    const start = async () => {
      if (connection.state === "Disconnected") {
        await connection.start();
      }

      connection.on("RequestCreated", handleCreated);
      connection.on("RequestApproved", handleApproved);
      connection.on("RequestRejected", handleRejected);
      connection.on("PlaybackChanged", handlePlaybackChanged);
      connection.on("PlaylistChanged", handlePlaylistChanged);

      await connection.invoke("JoinRestaurant", restaurantId);
    };

    start();

    return () => {
      connection.off("RequestCreated", handleCreated);
      connection.off("RequestApproved", handleApproved);
      connection.off("RequestRejected", handleRejected);
      connection.off("PlaybackChanged", handlePlaybackChanged);
      connection.off("PlaylistChanged", handlePlaylistChanged);

      connection.invoke("LeaveRestaurant", restaurantId).catch(() => {});
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
