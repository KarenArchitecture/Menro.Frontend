import React from "react";
import MusicSection from "../components/admin/MusicSection";
import MusicHeader from "../components/music/MusicPlayerHeader";

import "/public/admin-dashboard.css";

export default function AdminMusicPage() {
  return (
    <div className="admin-page">
      <MusicHeader />

      <div className="admin-content">
        <MusicSection />
      </div>
    </div>
  );
}
