import React, { useState } from "react";

export default function MusicSection() {
  const [activeTab, setActiveTab] = useState("search"); // 'search' | 'upload' | 'select'

  /** helper to toggle panes */
  const tabBtn = (key, iconClass, label) => (
    <button
      className={`music-tab-btn ${activeTab === key ? "active" : ""}`}
      onClick={() => setActiveTab(key)}
    >
      <i className={iconClass} /> {label}
    </button>
  );

  return (
    <div className="music-flex">
      {/* LEFT : tab + pane */}
      <div className="panel music-pane">
        <h3>افزودن موسیقی به پلی‌لیست</h3>

        <div className="music-tab-bar">
          {tabBtn("search", "fas fa-search", "جستجو آنلاین")}
          {tabBtn("upload", "fas fa-upload", "آپلود فایل")}
          {tabBtn("select", "fas fa-file-audio", "انتخاب از فایل")}
        </div>

        {/* —— SEARCH —— */}
        {activeTab === "search" && (
          <div className="music-tab-content">
            <p className="panel-subtitle">
              نام آهنگ یا هنرمند را برای جستجو در سرویس‌های آنلاین وارد کنید.
            </p>
            <div className="input-group-inline">
              <input
                type="text"
                placeholder="مثال: Homayoun Shajarian"
                style={{ flexGrow: 1 }}
              />
              <button className="btn btn-primary">جستجو</button>
            </div>

            <div className="search-results">
              {[
                {
                  src: "fab fa-spotify spotify-icon",
                  title: "Music Title 1",
                  artist: "Artist Name",
                },
                {
                  src: "fab fa-youtube youtube-icon",
                  title: "Another Song Title",
                  artist: "Another Artist",
                },
              ].map((r) => (
                <div key={r.title} className="search-result-item">
                  <div className="song-info">
                    <i className={r.src}></i>
                    <div>
                      <span className="song-title">{r.title}</span>
                      <span className="song-artist">{r.artist}</span>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm">
                    <i className="fas fa-plus"></i> افزودن
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* —— UPLOAD —— */}
        {activeTab === "upload" && (
          <div className="music-tab-content">
            <p className="panel-subtitle">
              یک فایل صوتی (mp3, wav…) را برای ذخیره در دیتابیس منرو آپلود کنید.
            </p>
            <input type="file" className="file-input" accept="audio/*" />
            <button className="btn btn-primary" style={{ marginTop: 15 }}>
              آپلود
            </button>
          </div>
        )}

        {/* —— SELECT —— */}
        {activeTab === "select" && (
          <div className="music-tab-content">
            <p className="panel-subtitle">
              فایل موسیقی خود را انتخاب کنید تا منرو نزدیک‌ترین آهنگ به نام فایل
              را پیدا و اضافه کند.
            </p>
            <input
              type="file"
              className="file-input"
              accept="audio/*"
              multiple
            />
            <button className="btn btn-primary" style={{ marginTop: 15 }}>
              افزودن به پلی‌لیست
            </button>
          </div>
        )}
      </div>

      {/* RIGHT : playlist (always visible – never shrinks left pane) */}
      <div className="panel playlist-panel">
        <div className="view-header" style={{ marginBottom: 20 }}>
          <h3>پلی‌لیست فعلی</h3>
          <span className="playlist-capacity">ظرفیت: ۱۲ / ۵۰</span>
        </div>

        <div className="playlist">
          {[
            { title: "نام آهنگ فعلی", artist: "نام هنرمند" },
            { title: "آهنگ بعدی", artist: "هنرمند دیگر" },
          ].map((s) => (
            <div key={s.title} className="playlist-item">
              <div className="song-info">
                <i className="fas fa-grip-vertical drag-handle"></i>
                <img
                  src="https://via.placeholder.com/40"
                  className="song-artwork"
                  alt=""
                />
                <div>
                  <span className="song-title">{s.title}</span>
                  <span className="song-artist">{s.artist}</span>
                </div>
              </div>
              <button className="btn btn-icon btn-danger" title="حذف">
                <i className="fas fa-trash" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
