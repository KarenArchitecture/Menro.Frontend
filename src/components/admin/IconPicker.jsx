import React, { useMemo, useState, useEffect } from "react";
import iconAxios from "../../api/iconAxios.js";
import fileAxios from "../../api/fileAxios.js";
export const ICON_BY_KEY = {};

// گرفتن لیست آیکن‌ها از بک‌اند
export async function fetchAllIcons() {
  try {
    const res = await iconAxios.get("/read-all");
    return res.data;
  } catch (err) {
    console.error("Error fetching icons:", err);
    return [];
  }
}

/** ----- IconPicker (فقط آیکن‌های دیتابیس) ----- */
export default function IconPicker({ open, onClose, value, onSelect }) {
  const [q, setQ] = useState("");
  const [backendIcons, setBackendIcons] = useState([]);

  useEffect(() => {
    if (open) {
      fetchAllIcons().then((data) => setBackendIcons(data || []));
    }
  }, [open]);

  // آیکن‌های بک‌اند
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return backendIcons;
    return backendIcons.filter((i) => {
      const label = (i.label || "").toLowerCase();
      const fileName = (i.fileName || "").toLowerCase();
      return label.includes(query) || fileName.includes(query);
    });
  }, [q, backendIcons]);

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
            const selected = value === item.id;

            return (
              <button
                key={item.id}
                className={`icon-cell ${selected ? "is-selected" : ""}`}
                onClick={() => onSelect?.(item.id)} // id به بک‌اند برمی‌گرده
                title={item.label || item.fileName}
                role="option"
                aria-selected={selected}
              >
                <span className="icon-cell__gfx">
                  <img
                    src={item.url}
                    alt={item.label || item.fileName}
                    width={24}
                    height={24}
                    style={{ objectFit: "contain" }}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="icon-cell__label">
                  {item.label || item.fileName}
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
