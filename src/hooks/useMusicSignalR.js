// src/hooks/useMusicSignalR.js
import { useEffect } from "react";
import { musicConnection } from "../utils/signalr";

export function useMusicSignalR(
  restaurantId,
  { onCreated, onApproved, onRejected } = {},
) {
  useEffect(() => {
    if (!restaurantId) return;

    const handleCreated = (data) => {
      console.log("CREATED:", data);
      onCreated?.(data);
    };

    const handleApproved = (data) => {
      console.log("APPROVED:", data);
      onApproved?.(data);
    };

    const handleRejected = (data) => {
      console.log("REJECTED:", data);
      onRejected?.(data);
    };

    const setup = async () => {
      musicConnection.on("RequestCreated", handleCreated);
      musicConnection.on("RequestApproved", handleApproved);
      musicConnection.on("RequestRejected", handleRejected);

      if (musicConnection.state === "Disconnected") {
        await musicConnection.start();
      }

      await musicConnection.invoke("JoinRestaurant", restaurantId);

      console.log("JOINED:", restaurantId);
    };

    setup();

    return () => {
      musicConnection.off("RequestCreated", handleCreated);
      musicConnection.off("RequestApproved", handleApproved);
      musicConnection.off("RequestRejected", handleRejected);
    };
  }, [restaurantId, onCreated, onApproved, onRejected]);
}
