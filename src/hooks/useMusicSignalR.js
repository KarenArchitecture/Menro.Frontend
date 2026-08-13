// src/hooks/useMusicSignalR.js
import { useEffect, useRef } from "react";
import {
  getMusicConnection,
  ensureMusicConnectionStarted,
  registerActiveRoom,
  unregisterActiveRoom,
} from "../utils/signalr";
import { MusicHubMethods, MusicHubEvents } from "../utils/musicHubContract";

export function useMusicSignalR(
  restaurantId,
  role, // "customer" | "admin"
  {
    onCreated,
    onApproved,
    onRejected,
    onPlaybackChanged,
    onPlaylistChanged,
  } = {},
) {
  const handlersRef = useRef({});
  handlersRef.current = {
    onCreated,
    onApproved,
    onRejected,
    onPlaybackChanged,
    onPlaylistChanged,
  };

  useEffect(() => {
    if (!restaurantId || !role) return;

    const connection = getMusicConnection();

    const joinMethod =
      role === "admin"
        ? MusicHubMethods.JoinAsAdmin
        : MusicHubMethods.JoinAsCustomer;
    const leaveMethod =
      role === "admin"
        ? MusicHubMethods.LeaveAsAdmin
        : MusicHubMethods.LeaveAsCustomer;

    const handleCreated = (data) => handlersRef.current.onCreated?.(data);
    const handleApproved = (data) => handlersRef.current.onApproved?.(data);
    const handleRejected = (data) => handlersRef.current.onRejected?.(data);
    const handlePlaybackChanged = (data) =>
      handlersRef.current.onPlaybackChanged?.(data);
    const handlePlaylistChanged = () =>
      handlersRef.current.onPlaylistChanged?.();

    let isCancelled = false;

    const start = async () => {
      try {
        await ensureMusicConnectionStarted();
        if (isCancelled) return;

        connection.on(MusicHubEvents.TrackRequested, handleCreated);
        connection.on(MusicHubEvents.TrackApproved, handleApproved);
        connection.on(MusicHubEvents.TrackRejected, handleRejected);
        connection.on(MusicHubEvents.PlaybackChanged, handlePlaybackChanged);
        connection.on(MusicHubEvents.PlaylistChanged, handlePlaylistChanged);

        await connection.invoke(joinMethod, restaurantId);
        registerActiveRoom(role, restaurantId, joinMethod);
      } catch (err) {
        console.error("SignalR music connection failed:", err);
      }
    };

    start();

    return () => {
      isCancelled = true;
      unregisterActiveRoom(role, restaurantId);

      connection.off(MusicHubEvents.TrackRequested, handleCreated);
      connection.off(MusicHubEvents.TrackApproved, handleApproved);
      connection.off(MusicHubEvents.TrackRejected, handleRejected);
      connection.off(MusicHubEvents.PlaybackChanged, handlePlaybackChanged);
      connection.off(MusicHubEvents.PlaylistChanged, handlePlaylistChanged);

      if (connection.state === "Connected") {
        connection.invoke(leaveMethod, restaurantId).catch(() => {});
      }
    };
  }, [restaurantId, role]);
}
