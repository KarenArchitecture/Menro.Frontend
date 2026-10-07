import { useEffect, useRef } from "react";
import { getMusicConnection } from "../utils/signalr";
import { MusicHubEvents } from "../utils/musicHubContract";

// عضویت گروه رو AdminNotificationProvider مدیریت می‌کنه؛ این hook فقط گوش می‌ده.
export function useMusicHubEvents({
  onCreated,
  onApproved,
  onRejected,
  onPlaybackChanged,
  onPlaylistChanged,
  onOrderCreated,
} = {}) {
  const handlersRef = useRef({});
  handlersRef.current = {
    onCreated,
    onApproved,
    onRejected,
    onPlaybackChanged,
    onPlaylistChanged,
    onOrderCreated,
  };

  useEffect(() => {
    const connection = getMusicConnection();
    const subs = [
      [
        MusicHubEvents.TrackRequested,
        (d) => handlersRef.current.onCreated?.(d),
      ],
      [
        MusicHubEvents.TrackApproved,
        (d) => handlersRef.current.onApproved?.(d),
      ],
      [
        MusicHubEvents.TrackRejected,
        (d) => handlersRef.current.onRejected?.(d),
      ],
      [
        MusicHubEvents.PlaybackChanged,
        (d) => handlersRef.current.onPlaybackChanged?.(d),
      ],
      [
        MusicHubEvents.PlaylistChanged,
        () => handlersRef.current.onPlaylistChanged?.(),
      ],
      [
        MusicHubEvents.OrderCreated,
        (d) => handlersRef.current.onOrderCreated?.(d),
      ],
    ];
    subs.forEach(([evt, fn]) => connection.on(evt, fn));
    return () => subs.forEach(([evt, fn]) => connection.off(evt, fn));
  }, []);
}
