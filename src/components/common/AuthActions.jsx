// components/home/AuthActions.jsx
import { Link, useNavigate } from "react-router-dom";

export default function AuthActions() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userPhone");
    navigate("/");
  };

  return (
    <nav className="auth-actions" aria-label="Auth actions">
      <Link className="auth-btn auth-btn--primary" to="/login">
        ورود
      </Link>
      <Link className="auth-btn auth-btn--outline" to="/register">
        ثبت‌ نام
      </Link>
      <Link className="auth-btn auth-btn--outline" to="/register-restaurant">
        ثبت رستوران
      </Link>
      <Link className="auth-btn auth-btn--ghost" to="/admin">
        پنل ادمین
      </Link>
      <button className="auth-btn auth-btn--danger" onClick={handleLogout}>
        خروج
      </button>
    </nav>
  );
}
