import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [35.6892, 51.389]; // تهران
const round6 = (n) => Math.round(n * 1e6) / 1e6;

const pinIcon = L.divIcon({
  className: "location-pin",
  html: '<i class="fa-solid fa-location-dot"></i>',
  iconSize: [36, 36],
  iconAnchor: [18, 34],
});

export default function RestaurantLocationPicker({
  latitude,
  longitude,
  onChange, // (lat | null, lng | null) => void
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const centeredRef = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");

  const hasPoint = latitude != null && longitude != null;

  // ساخت نقشه (فقط یک بار)
  useEffect(() => {
    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 11,
      scrollWheelZoom: false, // اسکرول صفحه با نقشه قاطی نشه
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        subdomains: "abcd",
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap &copy; CARTO",
      },
    ).addTo(map);

    map.on("click", (e) => {
      onChangeRef.current(round6(e.latlng.lat), round6(e.latlng.lng));
    });

    // با کلیک روی نقشه، زوم با اسکرول فعال می‌شه؛ با خروج موس دوباره غیرفعال
    map.on("focus", () => map.scrollWheelZoom.enable());
    map.on("blur", () => map.scrollWheelZoom.disable());

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // همگام‌سازی پین با state (هم لود اولیه‌ی پروفایل، هم کلیک/درگ/پاک کردن)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!hasPoint) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      centeredRef.current = false;
      return;
    }

    const latlng = [latitude, longitude];

    if (!markerRef.current) {
      const marker = L.marker(latlng, { icon: pinIcon, draggable: true }).addTo(
        map,
      );
      marker.on("dragend", (e) => {
        const p = e.target.getLatLng();
        onChangeRef.current(round6(p.lat), round6(p.lng));
      });
      markerRef.current = marker;
    } else {
      markerRef.current.setLatLng(latlng);
    }

    // فقط اولین باری که نقطه پیدا می‌شه نقشه رو روی اون ببر
    if (!centeredRef.current) {
      map.setView(latlng, 16);
      centeredRef.current = true;
    }
  }, [latitude, longitude, hasPoint]);

  const handleLocate = () => {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError("مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = round6(pos.coords.latitude);
        const lng = round6(pos.coords.longitude);
        onChangeRef.current(lat, lng);
        mapRef.current?.setView([lat, lng], 17);
        setLocating(false);
      },
      () => {
        setGeoError("دسترسی به موقعیت داده نشد. می‌توانید روی نقشه کلیک کنید.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="location-picker">
      <div className="location-toolbar">
        <button
          type="button"
          className="location-btn"
          onClick={handleLocate}
          disabled={locating}
        >
          {locating ? (
            <i className="fa-solid fa-spinner fa-spin" />
          ) : (
            <i className="fa-solid fa-crosshairs" />
          )}
          <span>موقعیت فعلی من</span>
        </button>

        {hasPoint && (
          <button
            type="button"
            className="location-btn location-btn--danger"
            onClick={() => onChangeRef.current(null, null)}
          >
            <i className="fa-solid fa-trash" />
            <span>حذف موقعیت</span>
          </button>
        )}

        {hasPoint && (
          <span className="location-coords" dir="ltr">
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </span>
        )}
      </div>

      <div className="location-map-wrapper">
        <div ref={containerRef} className="location-map" />
        {!hasPoint && (
          <div className="location-map-hint">
            <i className="fa-solid fa-hand-pointer" />
            روی نقشه کلیک کنید تا محل رستوران ثبت شود
          </div>
        )}
      </div>

      {geoError && <div className="location-error">{geoError}</div>}
      {hasPoint && (
        <div className="location-help">
          برای دقیق‌تر شدن، پین را بکشید و جابه‌جا کنید.
        </div>
      )}
    </div>
  );
}
