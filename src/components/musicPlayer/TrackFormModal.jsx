// src/components/musicPlayer/TrackFormModal.jsx
import React from "react";

/**
 * مودال ویرایش نام آهنگ. کاملاً controlled — دکمه‌ی «ویرایش نام»
 * داخل MusicArchiveCard است (کامپوننت خواهر)، پس state باز/بسته
 * بودن در MusicSection می‌ماند.
 */
export default function TrackFormModal({
  isOpen,
  name,
  onNameChange,
  onSubmit,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="mh-modal-backdrop">
      <div className="mh-modal">
        <h4 className="mh-modal__title">ویرایش نام آهنگ</h4>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            className="mh-input"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="نام جدید آهنگ را وارد کنید..."
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
