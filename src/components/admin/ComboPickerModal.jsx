// src/components/admin/ComboPickerModal.jsx
import React, { useMemo, useState } from "react";
import resolveFileUrl from "../../utils/resolveFileUrl";
import { useGlobalUI } from "../common/GlobalUI";

export default function ComboPickerModal({
  open,
  candidateFoods, // all foods NOT already combos and not the selected food itself
  onClose,
  onConfirm, // (selectedIds: number[]) => void
}) {
  const { notify, confirmModal } = useGlobalUI();
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());

  if (!open) return null;

  const filtered = candidateFoods.filter((f) =>
    f.name?.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    if (selectedIds.size === 0) return;
    onConfirm(Array.from(selectedIds));
    setSelectedIds(new Set());
    setQuery("");
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setQuery("");
    onClose?.();
  };

  const fmt = (n) => (Number(n) || 0).toLocaleString("fa-IR");

  return (
    <div
      id="combo-picker-modal"
      className="modal-overlay"
      style={{ display: "flex" }}
      onClick={(e) => e.target.id === "combo-picker-modal" && handleClose()}
    >
      <div className="modal-content combos-mgmt__picker-modal">
        <div className="modal-header">
          <h3>افزودن ترکیب پیشنهادی</h3>
          <button className="btn btn-icon" onClick={handleClose}>
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="modal-body">
          <div className="blog-mgmt__search-box" style={{ marginBottom: 16 }}>
            <input
              type="text"
              className="mh-input"
              placeholder="جستجوی غذا..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="empty-hint">
              {candidateFoods.length === 0
                ? "همه غذاهای رستوران شما در حال حاضر به این غذا اضافه شده‌اند."
                : "غذایی با این جستجو پیدا نشد."}
            </div>
          ) : (
            <div className="combos-mgmt__picker-grid">
              {filtered.map((f) => {
                const isChecked = selectedIds.has(f.id);
                return (
                  <button
                    type="button"
                    key={f.id}
                    className={`combos-mgmt__picker-item ${
                      isChecked ? "is-selected" : ""
                    }`}
                    onClick={() => toggle(f.id)}
                  >
                    <div className="combos-mgmt__picker-thumb-wrap">
                      {f.imageUrl ? (
                        <img
                          src={resolveFileUrl(f.imageUrl)}
                          alt={f.name}
                          className="combos-mgmt__picker-thumb"
                        />
                      ) : (
                        <i className="fas fa-utensils" />
                      )}
                    </div>
                    <div className="combos-mgmt__picker-info">
                      <span className="combos-mgmt__picker-name">{f.name}</span>
                      <span className="combos-mgmt__picker-price">
                        {fmt(f.price)} تومان
                      </span>
                    </div>
                    <span
                      className={`combos-mgmt__picker-check ${
                        isChecked ? "is-checked" : ""
                      }`}
                    >
                      {isChecked && <i className="fas fa-check" />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-primary"
            disabled={selectedIds.size === 0}
            onClick={handleConfirm}
          >
            افزودن {selectedIds.size > 0 ? `(${selectedIds.size} مورد)` : ""}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}
