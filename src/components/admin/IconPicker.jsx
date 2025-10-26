import React, { useMemo, useState, useEffect } from "react";
import iconAxios from "../../api/iconAxios.js";

export const ICON_BY_KEY = ICON_LIBRARY.reduce((acc, i) => {
  acc[i.key] = i.src; // map to URL string
  return acc;
}, {});

/** ----- Custom SVG storage (shown in picker, uploaded elsewhere) ----- */
const CUSTOM_ICONS_KEY = "admin.custom.icons"; // local cache of user-uploaded SVGs (data URLs)
const CUSTOM_PREFIX = "custom-";

function loadCustomIcons() {
  try {
    const raw = localStorage.getItem(CUSTOM_ICONS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// Expose list/remove for a separate Settings UI
export function listCustomIcons() {
  return loadCustomIcons();
}
export function removeCustomIcon(key) {
  const list = loadCustomIcons().filter((x) => x.key !== key);
  saveCustomIcons(list);
}
function saveCustomIcons(list) {
  try {
    localStorage.setItem(CUSTOM_ICONS_KEY, JSON.stringify(list || []));
  } catch {}
}

function slugifyBase(name = "") {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\-\u0600-\u06FF]/g, "")
    .toLowerCase();
}

/** Called from Settings (outside modal) after upload.
 * Store dataUrl now; later you can replace with server URL returned by your backend.
 */
export function registerCustomIcon({ label, dataUrl }) {
  const list = loadCustomIcons();
  const base = slugifyBase(label || "icon");
  let key = `${CUSTOM_PREFIX}${base}`;
  let i = 1;
  while (list.some((x) => x.key === key))
    key = `${CUSTOM_PREFIX}${base}-${i++}`;
  list.push({ key, label: label || key, dataUrl });
  saveCustomIcons(list);
  return key;
}

/** Render by key (library + custom) with <img>. */
export function renderIconByKey(key, { size = 24, alt } = {}) {
  if (!key) return null;

  // library (URL string)
  const libSrc = ICON_BY_KEY[key];
  if (libSrc) {
    return (
      <img
        src={libSrc}
        alt={alt || key}
        width={size}
        height={size}
        style={{ objectFit: "contain" }}
        loading="lazy"
        decoding="async"
      />
    );
  }

  // custom (dataUrl or future server URL)
  if (key.startsWith(CUSTOM_PREFIX)) {
    const found = loadCustomIcons().find((x) => x.key === key);
    if (found?.dataUrl) {
      return (
        <img
          src={found.dataUrl}
          alt={alt || found.label || key}
          width={size}
          height={size}
          style={{ objectFit: "contain" }}
          loading="lazy"
          decoding="async"
        />
      );
    }
  }

  return null;
}

/** ----- IconPicker (NO upload UI here) ----- */
export default function IconPicker({ open, onClose, value, onSelect }) {
  const [q, setQ] = useState("");
  const [customs, setCustoms] = useState([]);

  useEffect(() => {
    if (open) setCustoms(loadCustomIcons());
  }, [open]);

  // Merge library (static) + customs (user uploads)
  const merged = useMemo(() => {
    const lib = ICON_LIBRARY.map((x) => ({ ...x, type: "library" }));
    const cus = customs.map((x) => ({ ...x, type: "custom" }));
    return [...lib, ...cus];
  }, [customs]);

  // Simple search on key/label
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return merged;
    return merged.filter((i) => {
      const key = i.key?.toLowerCase() || "";
      const label = (i.label || "").toLowerCase();
      return key.includes(query) || label.includes(query);
    });
  }, [q, merged]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <h4>انتخاب آیکن</h4>
          <button className="btn btn-icon" onClick={onClose} aria-label="بستن">
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="icon-picker-search">
          <input
            type="text"
            placeholder="جستجوی آیکن…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="icon-grid" role="listbox" aria-label="Icon grid">
          {filtered.map((item) => {
            const selected = value === item.key;
            const isCustom = item.type === "custom";
            const src = isCustom ? item.dataUrl : item.src;

            return (
              <button
                key={item.key}
                className={`icon-cell ${selected ? "is-selected" : ""}`}
                onClick={() => onSelect?.(item.key)}
                title={item.label || item.key}
                role="option"
                aria-selected={selected}
              >
                <span className="icon-cell__gfx">
                  <img
                    src={src}
                    alt={item.label || item.key}
                    width={24}
                    height={24}
                    style={{ objectFit: "contain" }}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="icon-cell__label">
                  {item.label || item.key}
                  {isCustom && (
                    <span className="badge" style={{ marginInlineStart: 6 }}>
                      سفارشی
                    </span>
                  )}
                </span>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="empty-state">هیچ آیکنی مطابق جستجو پیدا نشد.</div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
