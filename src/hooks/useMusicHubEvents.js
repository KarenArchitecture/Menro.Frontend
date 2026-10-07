import { useEffect, useRef } from "react";
import { getMusicConnection } from "../utils/signalr";
import { MusicHubEvents } from "../utils/musicHubContract";

// عضویت گروه رو Provider سراسری مدیریت می‌کنه؛ این hook فقط گوش می‌ده.
export function useMusicHubEvents({
  onCreated,
  onApproved,
  onRejected,
  onPlaybackChanged,
  onPlaylistChanged,
} = {}) {
  const handlersRef = useRef({});
  handlersRef.current = {
    onCreated,
    onApproved,
    onRejected,
    onPlaybackChanged,
    onPlaylistChanged,
  };

  useEffect(() => {
    const connection = getMusicConnection();
    const h = handlersRef.current;
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
    ];
    subs.forEach(([evt, fn]) => connection.on(evt, fn));
    return () => subs.forEach(([evt, fn]) => connection.off(evt, fn));
  }, []);
}
