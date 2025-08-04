//components / home / AuthActions.jsx;
import { Link, useNavigate } from "react-router-dom";

export default function AuthActions() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userPhone");
    navigate("/"); // back to home
  };

  return (
    <div
      style={{ display: "flex", gap: "1rem", margin: "2rem 0", fontSize: 48 }}
    >
      <Link to="/login">ورود</Link>
      <Link to="/register">ثبت‌ نام</Link>
      <Link to="/register-restaurant">ثبت رستوران</Link>
      <button onClick={handleLogout}>خروج</button>
    </div>
  );
}
