// src/notifications/AdminNotificationProvider.jsx

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGlobalUI } from "../components/common/GlobalUI";
import ownerRestaurantAxios from "../api/ownerRestaurantAxios";
import {
  getMusicConnection,
  ensureMusicConnectionStarted,
  registerActiveRoom,
  unregisterActiveRoom,
} from "../utils/signalr";
import { MusicHubMethods, MusicHubEvents } from "../utils/musicHubContract";
import { NOTIFICATION_TYPES } from "./notificationConfig";

const NotificationContext = createContext({ push: () => {} });
export const useAdminNotifications = () => useContext(NotificationContext);

export function AdminNotificationProvider({ children }) {
  const { user } = useAuth();
  const { notify } = useGlobalUI();
  const navigate = useNavigate();
  const location = useLocation();
  const [restaurantId, setRestaurantId] = useState(null);

  const roles = []
    .concat(user?.role ?? user?.roles ?? [])
    .map((r) => String(r).toLowerCase());
  const isAdmin = roles.includes("owner");

  // آدرس فعلی در ref نگه داشته می‌شود تا push با هر تغییر صفحه ساخته نشود
  const pathRef = useRef(location.pathname + location.search);
  pathRef.current = location.pathname + location.search;

  const push = useCallback(
    (type) => {
      const cfg = NOTIFICATION_TYPES[type];
      if (!cfg) return;

      const alreadyThere = pathRef.current === cfg.path;

      notify({
        type: "info",
        title: cfg.title,
        message: cfg.message,
        duration: 8000,
        action: alreadyThere
          ? undefined
          : { label: "بررسی", onClick: () => navigate(cfg.path) },
      });
    },
    [notify, navigate],
  );

  useEffect(() => {
    if (!isAdmin) {
      setRestaurantId(null);
      return;
    }
    let cancelled = false;
    ownerRestaurantAxios
      .get("/context")
      .then(({ data }) => {
        if (!cancelled) setRestaurantId(data.restaurantId);
      })
      .catch((err) => console.error("restaurant context error:", err));
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!restaurantId) return;

    const connection = getMusicConnection();
    const onRequested = () => push("music_request");
    const onOrder = () => push("order");
    let cancelled = false;

    connection.on(MusicHubEvents.TrackRequested, onRequested);
    connection.on(MusicHubEvents.OrderCreated, onOrder);

    (async () => {
      try {
        await ensureMusicConnectionStarted();
        if (cancelled) return;
        await connection.invoke(MusicHubMethods.JoinAsAdmin, restaurantId);
        if (cancelled) return;
        registerActiveRoom("admin", restaurantId, MusicHubMethods.JoinAsAdmin);
      } catch (err) {
        console.error("Admin music notifications failed:", err);
      }
    })();

    return () => {
      cancelled = true;
      unregisterActiveRoom("admin", restaurantId);
      connection.off(MusicHubEvents.TrackRequested, onRequested);
      connection.off(MusicHubEvents.OrderCreated, onOrder);
      if (connection.state === "Connected") {
        connection
          .invoke(MusicHubMethods.LeaveAsAdmin, restaurantId)
          .catch(() => {});
      }
    };
  }, [restaurantId, push]);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
