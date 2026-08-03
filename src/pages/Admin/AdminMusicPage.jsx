import React from "react";
import MusicSection from "../../components/admin/MusicSection";
import MusicHeader from "../../components/music/MusicPlayerHeader";
import "/public/admin-dashboard.css";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function AdminMusicPage() {
  useDocumentTitle("پخش‌کننده موسیقی");
  return (
    <div className="admin-page">
      <MusicHeader />
      <div className="admin-content">
        <MusicSection />
      </div>
    </div>
  );
}
