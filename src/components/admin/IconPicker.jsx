import React, { useMemo, useState, useEffect } from "react";
import iconAxios from "../../api/iconAxios.js";
export const ICON_BY_KEY = {};

function DefaultIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15" />
      <path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function renderIconByKey(key) {
  const IconComponent = ICON_BY_KEY[key];
  return IconComponent ? <IconComponent /> : <DefaultIcon />;
}

export async function fetchAllIcons() {
  try {
    const res = await iconAxios.get("/read-all");
    return res.data;
  } catch (err) {
    console.error("Error fetching icons:", err);
    return [];
  }
}

export default function IconPicker({ open, onClose, value, onSelect }) {
  const [q, setQ] = useState("");
  const [backendIcons, setBackendIcons] = useState([]);

  useEffect(() => {
    if (open) {
      fetchAllIcons().then((data) => setBackendIcons(data || []));
    }
  }, [open]);

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

  // 🔸 delete handler (frontend only — backend-ready)
  const handleDeleteIcon = async (id) => {
    console.log("Delete icon clicked:", id);
    // backend: await iconAxios.delete(`/delete/${id}`)
    setBackendIcons((prev) => prev.filter((x) => x.id !== id));
  };

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
              <div
                key={item.id}
                className={`icon-cell-wrapper ${selected ? "is-selected" : ""}`}
              >
                <button
                  className={`icon-cell ${selected ? "is-selected" : ""}`}
                  onClick={() => onSelect?.(item.id)}
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

                {/* 🗑 Trash icon (hover visible) */}
                <button
                  className="delete-icon-btn"
                  title="حذف آیکن"
                  onClick={() => handleDeleteIcon(item.id)}
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
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
