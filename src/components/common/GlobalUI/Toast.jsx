// src/components/common/GlobalUI/Toast.jsx

const ICONS = {
  success: "fa-solid fa-circle-check",
  error: "fa-solid fa-circle-exclamation",
  warning: "fa-solid fa-triangle-exclamation",
  info: "fa-solid fa-circle-info",
};

export default function ToastStack({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="gui-toast-stack" role="region" aria-label="اعلان‌ها">
      {toasts.map((t) => (
        <div key={t.id} className={`gui-toast gui-toast--${t.type}`} role="status">
          <i className={`gui-toast__icon ${ICONS[t.type] || ICONS.info}`} />
          <div className="gui-toast__body">
            {t.title && <div className="gui-toast__title">{t.title}</div>}
            {t.message && <div className="gui-toast__message">{t.message}</div>}
          </div>
          <button
            type="button"
            className="gui-toast__close"
            aria-label="بستن"
            onClick={() => onDismiss(t.id)}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      ))}
    </div>
  );
}
