// src/components/common/RestaurantMapView.jsx
// نقشه‌ی فقط‌نمایشی نشان برای صفحه‌ی عمومی (بدون تعامل)
import { useEffect, useRef } from "react";
import L from "@neshan-maps-platform/leaflet";
import "@neshan-maps-platform/leaflet/dist/leaflet.css";

const MAP_KEY = import.meta.env.VITE_NESHAN_MAP_KEY;

// طراحی صفحه روشنه، پس استایل روشن. اگه خوشت نیومد "standard-night" یا
// یکی از استایل‌های دیگه‌ی مستندات رو بذار
const MAP_TYPE = "standard-night";

export default function RestaurantMapView({
  latitude,
  longitude,
  zoom = 16,
  className = "",
  onError,
}) {
  const containerRef = useRef(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!MAP_KEY || !containerRef.current) return;

    const center = [Number(latitude), Number(longitude)];
    let map;
    let ro;

    try {
      map = new L.Map(containerRef.current, {
        key: MAP_KEY,
        maptype: MAP_TYPE,
        center,
        zoom,
        zoomControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
      });

      // اگه اندازه‌ی کانتینر عوض شد، نقشه دوباره روی مختصات وسط بمونه
      ro = new ResizeObserver(() => {
        map.invalidateSize();
        map.setView(center, zoom, { animate: false });
      });
      ro.observe(containerRef.current);
    } catch (err) {
      console.error("Neshan map failed:", err);
      onErrorRef.current?.(err);
    }

    return () => {
      ro?.disconnect();
      map?.remove();
    };
  }, [latitude, longitude, zoom]);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}
