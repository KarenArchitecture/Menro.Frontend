import React from "react";
import MusicSection from "../components/admin/MusicSection"; // <-- your pasted component
import AdminHeader from "../components/admin/AdminHeader";
import "/public/admin-dashboard.css"; // <-- your pasted CSS
export default function AdminMusicPage() {
  return (
    <div className="admin-page">
      <AdminHeader />

      <div className="admin-content">
        <MusicSection />
      </div>
    </div>
  );
}
