import ReactDOM from "react-dom";
import "../../assets/css/protected-action-modal.css";

export default function ProtectedActionModal({
    open,
    onClose,
    onLogin,

    icon,
    title = "ورود لازم است",
    description,

    loginText = "ورود به حساب",
    cancelText = "بعداً وارد می‌شوم",
    }) {
    if (!open) return null;

    const modal = (
        <div className="protected-action-backdrop" onClick={onClose}>

        <div
            className="protected-action-modal"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="protected-action-glow" />
            <div className="protected-action-shine" />

            <button
            className="protected-action-close"
            onClick={onClose}
            aria-label="بستن"
            >
            ×
            </button>

            {icon && <div className="protected-action-icon">{icon}</div>}

            <h2 className="protected-action-title">{title}</h2>

            <div className="protected-action-description">{description}</div>

            <div className="protected-action-actions">
            <button className="protected-action-login" onClick={onLogin}>
                {loginText}
            </button>

            <button className="protected-action-later" onClick={onClose}>

                {cancelText}
            </button>
            </div>
        </div>
        </div>
    );

  // 🔑 همیشه مستقیم به body پورتال می‌شه؛ فرقی نمی‌کنه از داخل یک modal
  // پورتال‌شده (ItemDetailModal) صداش بزنی یا از داخل یک کامپوننت معمولی
  // (MobileNav) — دیگه هیچ ancestor با transform/overflow نمی‌تونه
  // position:fixed رو بشکنه یا زیرش پنهانش کنه.
    return ReactDOM.createPortal(modal, document.body);

}