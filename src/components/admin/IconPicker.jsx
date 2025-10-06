// components/categories/IconPicker.jsx
import React, { useMemo, useState } from "react";

/**
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - icons: Array<{ key: string, label: string, Icon: React.FC }>
 * - value?: string  (selected iconKey)
 * - onSelect: (iconKey: string) => void
 */
export default function IconPicker({ open, onClose, icons, value, onSelect }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim();
    if (!query) return icons;
    return icons.filter(
      (i) =>
        i.key.toLowerCase().includes(query.toLowerCase()) ||
        (i.label && i.label.includes(query))
    );
  }, [q, icons]);

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
          {filtered.map(({ key, label, Icon }) => {
            const selected = value === key;
            return (
              <button
                key={key}
                className={`icon-cell ${selected ? "is-selected" : ""}`}
                onClick={() => onSelect(key)}
                title={label || key}
                role="option"
                aria-selected={selected}
              >
                <span className="icon-cell__gfx">
                  <Icon />
                </span>
                <span className="icon-cell__label">{label || key}</span>
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
