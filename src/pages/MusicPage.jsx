import React, { useState } from "react";
import MusicTrack from "../components/music/MusicTrack";
import MusicRequestModal from "../components/music/MusicRequestModal";
import {
  playlistTracks,
  requestModalTracks,
} from "../components/music/musicTracks";
import "../assets/css/styles-music.css";

export default function MusicPage() {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState(null);

  const closeModal = () => {
    setIsRequestModalOpen(false);
    setSearchQuery("");
  };

  return (
    <div
      className={`music-page ${isRequestModalOpen ? "is-modal-open" : ""}`}
      dir="rtl"
    >
      <header className="music-page__header">
        <button className="music-page__back" type="button" aria-label="بازگشت">
          <img
            src="/images/music/back-music-icon.svg"
            alt=""
            aria-hidden="true"
            className="music-page__back-icon"
          />
        </button>

        <div className="music-page__header-text">
          <img
            src="/images/music/music-note-icon.svg"
            alt=""
            aria-hidden="true"
            className="music-page__header-icon"
          />
          <h1 className="music-page__title">موسیقی در حال پخش</h1>
        </div>
      </header>

      <main className="music-page__content" aria-hidden={isRequestModalOpen}>
        <section className="music-page__list" aria-label="لیست آهنگ‌ها">
          {playlistTracks.map((track) => (
            <MusicTrack
              key={track.id}
              title={track.title}
              subtitle={track.subtitle}
              image={track.image}
              status={track.status}
              active={track.active}
              onActionClick={() => {
                // later: copy action
              }}
            />
          ))}
        </section>

        <div className="music-page__footer">
          {isRequestModalOpen ? (
            <div className="music-page__search">
              <img
                src="/images/music/search-icon.svg"
                alt=""
                aria-hidden="true"
                className="music-page__search-icon"
              />
              <input
                className="music-page__search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="نام موسیقی را در لیست جستجو کنید..."
              />
            </div>
          ) : (
            <button
              className="music-page__request-btn"
              type="button"
              onClick={() => setIsRequestModalOpen(true)}
            >
              درخواست موسیقی
            </button>
          )}
        </div>
      </main>

      <MusicRequestModal
        open={isRequestModalOpen}
        tracks={requestModalTracks}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClose={closeModal}
        selectedTrackId={selectedTrackId}
        remainingRequests={1}
        onRequestTrack={(track) => {
          setSelectedTrackId(track.id);
        }}
      />
    </div>
  );
}
