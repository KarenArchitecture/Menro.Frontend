// src/hooks/useMusicSignalR.js
import { useEffect } from "react";
import { getMusicConnection } from "../utils/signalr";

export function useMusicSignalR(
  restaurantId,
  { onCreated, onApproved, onRejected } = {},
) {
  useEffect(() => {
    if (!restaurantId) return;

    const connection = getMusicConnection();

    const handleCreated = (data) => onCreated?.(data);
    const handleApproved = (data) => onApproved?.(data);
    const handleRejected = (data) => onRejected?.(data);

    const start = async () => {
      if (connection.state === "Disconnected") {
        await connection.start();
      }

      connection.on("RequestCreated", handleCreated);
      connection.on("RequestApproved", handleApproved);
      connection.on("RequestRejected", handleRejected);

      await connection.invoke("JoinRestaurant", restaurantId);
    };

    start();

    return () => {
      connection.off("RequestCreated", handleCreated);
      connection.off("RequestApproved", handleApproved);
      connection.off("RequestRejected", handleRejected);

      // مهم: leave group
      connection.invoke("LeaveRestaurant", restaurantId).catch(() => {});
    };
  }, [restaurantId, onCreated, onApproved, onRejected]);
}
