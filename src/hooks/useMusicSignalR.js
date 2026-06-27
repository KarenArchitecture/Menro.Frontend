// src/hooks/useMusicSignalR.js
import { useEffect } from "react";
import { musicConnection } from "../utils/signalr";
import { toast } from "react-hot-toast";

export function useMusicSignalR(restaurantId, onRefreshRequests) {
  const onCreated = (data) => {
    console.log("EVENT RECEIVED:", data);
    toast.success(`درخواست جدید: ${data.title}`);
    onRefreshRequests?.();
  };

  const onApproved = (data) => {
    toast.success("درخواست تأیید شد");
    onRefreshRequests?.();
  };

  const onRejected = (data) => {
    toast.error("درخواست رد شد");
    onRefreshRequests?.();
  };

  useEffect(() => {
    if (!restaurantId) return;

    const setup = async () => {
      musicConnection.on("RequestCreated", onCreated);
      musicConnection.on("RequestApproved", onApproved);
      musicConnection.on("RequestRejected", onRejected);

      if (musicConnection.state === "Disconnected") {
        await musicConnection.start();
      }

      await musicConnection.invoke("JoinRestaurant", restaurantId);
      console.log("JOINED:", restaurantId);
    };

    setup();

    return () => {
      musicConnection.off("RequestCreated", onCreated);
      musicConnection.off("RequestApproved", onApproved);
      musicConnection.off("RequestRejected", onRejected);
    };
  }, [restaurantId]);
}
