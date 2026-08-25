// src/components/musicPlayer/PlaylistFormModal.jsx
import React from "react";

/**
 * مودال ساخت/ویرایش پلی‌لیست. کاملاً controlled است چون دکمه‌های
 * باز کردنش (پلی‌لیست جدید / ویرایش) داخل PlaylistCard هستند —
 * یک کامپوننت خواهر، نه فرزند این مودال — پس state باز/بسته بودن
 * باید در MusicSection (والد مشترک) بماند.
 */
export default function PlaylistFormModal({
  isOpen,
  mode, // "add" | "edit"
  name,
  onNameChange,
  onSubmit,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="mh-modal-backdrop">
      <div className="mh-modal">
        <h4 className="mh-modal__title">
          {mode === "add" ? "ایجاد پلی‌لیست جدید" : "ویرایش پلی‌لیست"}
        </h4>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            className="mh-input"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="نام پلی‌لیست را وارد کنید..."
            autoFocus
          />
          <div className="mh-modal__footer">
            <button
              type="button"
              className="mh-btn mh-btn--ghost"
              onClick={onClose}
            >
              لغو
            </button>
            <button
              type="submit"
              className="mh-btn mh-btn--primary"
              disabled={!name.trim()}
            >
              ذخیره
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
