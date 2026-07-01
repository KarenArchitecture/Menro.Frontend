import { FaPowerOff } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function AdminHeader() {
  useEffect(() => {
    document.title = "Music Player";
  }, []);
  const navigate = useNavigate();

  const handleGoAdmin = () => {
    navigate("/admin");
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "12px 16px",
        direction: "rtl",
      }}
    >
      <button
        onClick={handleGoAdmin}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#fff",
          flexDirection: "row-reverse",
          padding: "10px",
        }}
      >
        <FaPowerOff size={35} />
      </button>
    </header>
  );
}
