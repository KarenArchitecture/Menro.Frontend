// src/components/admin/ComboPickerModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import resolveFileUrl from "../../utils/resolveFileUrl";
import { groupFoodsByCategory } from "../../utils/groupFoodsByCategory";

export default function ComboPickerModal({
  open,
  candidateFoods,
  onClose,
  onConfirm,
  submitting = false,
}) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [openCats, setOpenCats] = useState(new Set());

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = q
      ? candidateFoods.filter((f) => f.name?.toLowerCase().includes(q))
      : candidateFoods;

    return groupFoodsByCategory(filtered);
  }, [candidateFoods, query]);

  // ✅ useEffect باید همینجا باشه، قبل از هر return شرطی
  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set());
      setQuery("");
      setOpenCats(new Set());
    }
  }, [open]);

  if (!open) return null; // ✅ حالا این بعد از همه‌ی hook هاست

  const isOpen = (cat) => openCats.has(cat);

  const toggleGroup = (cat) => {
    setOpenCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    if (selectedIds.size === 0 || submitting) return;
    onConfirm(Array.from(selectedIds));
  };

  const handleClose = () => {
    if (submitting) return;
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
          <button
            className="btn btn-icon"
            onClick={handleClose}
            disabled={submitting}
          >
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

          {grouped.length === 0 ? (
            <div className="empty-hint">
              {candidateFoods.length === 0
                ? "همه غذاهای رستوران شما در حال حاضر به این غذا اضافه شده‌اند."
                : "غذایی با این جستجو پیدا نشد."}
            </div>
          ) : (
            <div className="combos-mgmt__picker-scroll">
              {grouped.map((group) => (
                <div
                  key={group.categoryName}
                  className="combos-mgmt__cat-group"
                >
                  <button
                    type="button"
                    className={`combos-mgmt__cat-toggle ${
                      isOpen(group.categoryName) ? "open" : ""
                    }`}
                    onClick={() => toggleGroup(group.categoryName)}
                  >
                    <span>{group.categoryName}</span>

                    <span className="pill-count">
                      {group.foods.length.toLocaleString("fa-IR")}
                    </span>

                    <i className="fas fa-chevron-down" />
                  </button>

                  {isOpen(group.categoryName) && (
                    <div className="combos-mgmt__picker-grid">
                      {group.foods.map((f) => {
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
                            <span className="combos-mgmt__picker-thumb-wrap">
                              <i className="fas fa-utensils" />
                              {f.imageUrl && (
                                <img
                                  src={resolveFileUrl(f.imageUrl)}
                                  alt={f.name}
                                  className="combos-mgmt__picker-thumb"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              )}
                            </span>

                            <div className="combos-mgmt__picker-info">
                              <span className="combos-mgmt__picker-name">
                                {f.name}
                              </span>

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
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-primary"
            disabled={selectedIds.size === 0 || submitting}
            onClick={handleConfirm}
          >
            {submitting ? (
              <>
                <span className="submit-spinner" aria-hidden="true" />
                در حال افزودن...
              </>
            ) : (
              <>
                افزودن
                {selectedIds.size > 0 &&
                  ` (${selectedIds.size.toLocaleString("fa-IR")} مورد)`}
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={submitting}
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}
