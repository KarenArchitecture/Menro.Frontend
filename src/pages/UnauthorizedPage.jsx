// src/pages/UnauthorizedPage.jsx
import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#111",
        color: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        🚫 دسترسی غیرمجاز
      </h1>
      <p style={{ marginBottom: "2rem", opacity: 0.8 }}>
        شما اجازه ورود به این صفحه را ندارید.
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <Link
          to="/"
          style={{
            background: "#ffcc00",
            color: "#000",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          صفحه اصلی
        </Link>
        <Link
          to="/login"
          style={{
            background: "#333",
            color: "#fff",
            padding: "0.5rem 1rem",
            border: "1px solid #444",
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          صفحه ورود
        </Link>
      </div>
    </div>
  );
}
