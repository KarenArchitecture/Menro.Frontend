// RestaurantLocationPicker.jsx  (نسخه‌ی نشان)
import { useEffect, useRef, useState, useCallback } from "react";
import nmp_mapboxgl from "@neshan-maps-platform/mapbox-gl";
import "@neshan-maps-platform/mapbox-gl/dist/NeshanMapboxGl.css";
import {
  searchPlaces,
  reverseGeocode,
  isNeshanServiceEnabled,
  isRequestCanceled,
} from "../../api/neshan";

// کلید نقشه (web.xxx) از فایل .env
const MAP_KEY = import.meta.env.VITE_NESHAN_MAP_KEY;

const DEFAULT_CENTER = [51.389, 35.6892]; // [lng, lat] تهران
const DEFAULT_ZOOM = 11;
const PICK_ZOOM = 16;

// انواع: neshanVector | neshanVectorNight | neshanRaster | neshanRasterNight | osmRaster | dreamy | dreamyGold
const MAP_TYPE = "neshanVector";

const round6 = (n) => Math.round(n * 1e6) / 1e6;

export default function RestaurantLocationPicker({
  latitude,
  longitude,
  onChange,
  onAddressSelect, // اختیاری: (address: string) => void
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const searchBoxRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const internalChangeRef = useRef(false); // تغییرِ ناشی از کلیک/درگ کاربر
  const skipSearchRef = useRef(false);

  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [resolvedAddress, setResolvedAddress] = useState("");

  const hasLocation = latitude != null && longitude != null;

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // ثبت مختصات جدید (کلیک، درگ، جستجو، GPS)
  const commit = useCallback((lat, lng) => {
    internalChangeRef.current = true;
    onChangeRef.current?.(round6(lat), round6(lng));
  }, []);

  // ---------- ساخت نقشه (فقط یک‌بار) ----------
  useEffect(() => {
    if (!MAP_KEY || !containerRef.current) return;

    const startAt =
      latitude != null && longitude != null
        ? [Number(longitude), Number(latitude)]
        : DEFAULT_CENTER;

    const map = new nmp_mapboxgl.Map({
      mapType: nmp_mapboxgl.Map.mapTypes[MAP_TYPE],
      container: containerRef.current,
      center: startAt,
      zoom: latitude != null ? PICK_ZOOM : DEFAULT_ZOOM,
      minZoom: 4,
      maxZoom: 21,
      pitch: 0,
      poi: true,
      traffic: false,
      trackResize: true,
      mapKey: MAP_KEY,
    });

    try {
      map.addControl(
        new nmp_mapboxgl.NavigationControl({ showCompass: false }),
        "bottom-left",
      );
    } catch {
      /* کنترل زوم اختیاریه */
    }

    map.on("click", (e) => commit(e.lngLat.lat, e.lngLat.lng));
    mapRef.current = map;

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- همگام‌سازی مارکر با props ----------
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!hasLocation) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const lngLat = [Number(longitude), Number(latitude)];

    if (!markerRef.current) {
      const el = document.createElement("div");
      el.className = "location-pin";
      el.innerHTML = '<i class="fa-solid fa-location-dot"></i>';

      const marker = new nmp_mapboxgl.Marker({
        element: el,
        anchor: "bottom",
        draggable: true,
      })
        .setLngLat(lngLat)
        .addTo(map);

      marker.on("dragend", () => {
        const p = marker.getLngLat();
        commit(p.lat, p.lng);
      });
      markerRef.current = marker;
    } else {
      markerRef.current.setLngLat(lngLat);
    }

    // اگه تغییر از بیرون اومده (مثلاً لود پروفایل) نقشه رو ببر اون‌جا
    if (!internalChangeRef.current) {
      map.jumpTo({ center: lngLat, zoom: PICK_ZOOM });
    }
    internalChangeRef.current = false;
  }, [latitude, longitude, hasLocation, commit]);

  // ---------- تشخیص آدرس از روی مختصات ----------
  useEffect(() => {
    if (!isNeshanServiceEnabled || !onAddressSelect || !hasLocation) {
      setResolvedAddress("");
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const addr = await reverseGeocode(
          latitude,
          longitude,
          controller.signal,
        );
        setResolvedAddress(addr || "");
      } catch (err) {
        if (!isRequestCanceled(err)) setResolvedAddress("");
      }
    }, 600);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [latitude, longitude, hasLocation, onAddressSelect]);

  // ---------- جستجو ----------
  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }
    const term = query.trim();
    if (!isNeshanServiceEnabled || term.length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const c = mapRef.current?.getCenter();
        const items = await searchPlaces(
          term,
          {
            lat: c?.lat ?? DEFAULT_CENTER[1],
            lng: c?.lng ?? DEFAULT_CENTER[0],
          },
          controller.signal,
        );
        setResults(items.slice(0, 8));
      } catch (err) {
        if (!isRequestCanceled(err)) setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  // بستن لیست نتایج با کلیک بیرون
  useEffect(() => {
    const onDown = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const handleSelectResult = (r) => {
    skipSearchRef.current = true;
    setQuery(r.title);
    setResults([]);
    commit(r.lat, r.lng);
    mapRef.current?.flyTo({ center: [r.lng, r.lat], zoom: PICK_ZOOM });
  };

  // Enter توی فیلد جستجو نباید کل فرم پروفایل رو submit کنه
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") e.preventDefault();
    if (e.key === "Escape") setResults([]);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoError("مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند.");
      return;
    }
    setGeoError("");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        commit(lat, lng);
        mapRef.current?.flyTo({ center: [lng, lat], zoom: PICK_ZOOM });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setGeoError(
          err.code === 1
            ? "دسترسی به موقعیت مکانی رد شد. اجازه‌ی دسترسی را در مرورگر فعال کنید."
            : "دریافت موقعیت فعلی ممکن نشد. لطفاً دوباره تلاش کنید یا روی نقشه کلیک کنید.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleClear = () => {
    internalChangeRef.current = true;
    onChangeRef.current?.(null, null);
    setResolvedAddress("");
  };

  return (
    <div className="location-picker">
      {isNeshanServiceEnabled && (
        <div className="location-search" ref={searchBoxRef}>
          <i className="fa-solid fa-magnifying-glass location-search__icon" />
          <input
            type="text"
            className="location-search__input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="جستجوی محله، خیابان یا نام مکان..."
            autoComplete="off"
          />
          {searching && (
            <i className="fa-solid fa-spinner fa-spin location-search__spinner" />
          )}
          {results.length > 0 && (
            <ul className="location-search__results">
              {results.map((r, i) => (
                <li key={`${r.lat}-${r.lng}-${i}`}>
                  <button type="button" onClick={() => handleSelectResult(r)}>
                    <strong>{r.title}</strong>
                    {r.address && <span>{r.address}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="location-toolbar">
        <button
          type="button"
          className="location-btn"
          onClick={handleLocateMe}
          disabled={locating || !MAP_KEY}
        >
          <i
            className={
              locating
                ? "fa-solid fa-spinner fa-spin"
                : "fa-solid fa-location-crosshairs"
            }
          />
          موقعیت فعلی من
        </button>

        {hasLocation && (
          <button
            type="button"
            className="location-btn location-btn--danger"
            onClick={handleClear}
          >
            <i className="fa-solid fa-trash" />
            حذف موقعیت
          </button>
        )}

        {hasLocation && (
          <span className="location-coords" dir="ltr">
            {Number(latitude).toFixed(6)}, {Number(longitude).toFixed(6)}
          </span>
        )}
      </div>

      <div className="location-map-wrapper">
        {MAP_KEY ? (
          <div ref={containerRef} className="location-map" />
        ) : (
          <div className="location-map location-map--disabled">
            <i className="fa-solid fa-map-location-dot" />
            <span>کلید نقشه نشان هنوز تنظیم نشده است</span>
          </div>
        )}

        {MAP_KEY && !hasLocation && (
          <div className="location-map-hint">
            <i className="fa-solid fa-hand-pointer" />
            روی نقشه کلیک کنید تا موقعیت رستوران ثبت شود
          </div>
        )}
      </div>

      {geoError && <div className="location-error">{geoError}</div>}

      {resolvedAddress && (
        <div className="location-address-suggest">
          <div className="location-address-suggest__text">
            <i className="fa-solid fa-map-pin" />
            <span>{resolvedAddress}</span>
          </div>
          <button
            type="button"
            className="location-btn"
            onClick={() => onAddressSelect(resolvedAddress)}
          >
            استفاده به عنوان آدرس رستوران
          </button>
        </div>
      )}

      <div className="location-help">
        می‌توانید پین را بکشید تا دقیق‌تر جابه‌جا شود.
      </div>
    </div>
  );
}
