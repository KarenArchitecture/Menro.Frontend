import { FaPowerOff } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useGlobalUI } from "../../components/common/GlobalUI";

export default function MusicPlayerHeader() {
  useEffect(() => {
    document.title = "Music Player";
  }, []);
  const navigate = useNavigate();
  const { confirmModal } = useGlobalUI();

  const handleGoAdmin = async () => {
    const ok = await confirmModal({
      title: "خروج از موزیک پلیر",
      message: "آیا از خروج مطمئن هستید؟",
      confirmText: "خروج",
      cancelText: "انصراف",
      danger: true,
    });

    if (!ok) return;

    if (window.opener && !window.opener.closed) {
      window.close();
    } else {
      navigate("/admin");
    }
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
