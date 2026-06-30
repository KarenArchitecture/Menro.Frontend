import "../../assets/css/login-required-modal.css";
import LikeIcon from "../icons/LikeIcon";

export default function LoginRequiredModal({
    open,
    onClose,
    onLogin,
    }) {
    if (!open) return null;

    return (
        <div
        className="login-required-backdrop"
        onClick={onClose}
        >
        <div
            className="login-required-modal"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Glow */}
            <div className="login-required-glow"></div>
            <div className="login-required-shine"></div>

            {/* Close */}
            <button
            className="login-required-close"
            onClick={onClose}
            aria-label="بستن"
            >
            ×
            </button>

            {/* Heart */}
            <div className="login-required-heart">
                <LikeIcon />
            </div>

            {/* Title */}
            <h2 className="login-required-title">
            ورود لازم است
            </h2>

            {/* Description */}
            <p className="login-required-description">
            برای افزودن این غذا به
            <span> علاقه‌مندی‌ها </span>
            ابتدا وارد حساب کاربری خود شوید.
            </p>

            {/* Buttons */}
            <div className="login-required-actions">
            <button
                className="login-required-login"
                onClick={onLogin}
            >
                ورود به حساب
            </button>

            <button
                className="login-required-later"
                onClick={onClose}
            >
                بعداً وارد میشم
            </button>
            </div>
        </div>
        </div>
    );
}