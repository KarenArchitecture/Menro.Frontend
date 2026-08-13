// MusicPage.jsx

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MusicTrack from "../components/music/MusicTrack";
import MusicRequestModal from "../components/music/MusicRequestModal";
import OrderSuccessModal from "../components/common/OrderSuccessModal";
import { useGlobalUI } from "../components/common/GlobalUI";
import useDocumentTitle from "../hooks/useDocumentTitle";

import "../assets/css/styles-music.css";

import { useMusicSignalR } from "../hooks/useMusicSignalR";

import { getPublicMusic, requestTrack } from "../api/music";

export default function MusicPage() {
  useDocumentTitle("پخش‌کننده موسیقی");
  const navigate = useNavigate();
  const location = useLocation();

  const restaurantId = location.state?.restaurantId;

  const [tracks, setTracks] = useState([]);
  const [playback, setPlayback] = useState(null);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [showMusicSuccess, setShowMusicSuccess] = useState(false);

  const { alertModal } = useGlobalUI();

  // fetch playlist
  const fetchMusic = async () => {
    try {
      const res = await getPublicMusic(restaurantId);

      setTracks(res.data.tracks ?? []);

      setPlayback({
        currentTrackId: res.data.currentTrackId,
      });

      const myRequestedTrack = res.data.tracks?.find(
        (x) => x.status === "MineRequested",
      );

      setSelectedTrackId(myRequestedTrack?.id ?? null);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (!restaurantId) {
      navigate(-1);
      return;
    }

    fetchMusic();
  }, [restaurantId]);

  /* REQUEST MODAL */
  //--load data for modal
  const requestTracks = tracks.map((track) => ({
    id: track.id,
    title: track.title,
    subtitle: track.subtitle,
    image: track.imageUrl,

    status: track.status === "MineRequested" ? "mineRequested" : null,

    active: playback?.currentTrackId === track.id,

    canRequest:
      track.status !== "MineRequested" && track.status !== "Requested",
  }));
  //--open request modal
  const handleOpenRequestModal = () => {
    setIsRequestModalOpen(true);
  };
  //--handle request
  const handleRequestTrack = async (track) => {
    try {
      await requestTrack(restaurantId, {
        musicTrackId: track.id,
      });

      setIsRequestModalOpen(false);
      setSearchQuery("");
      setShowMusicSuccess(true);
    } catch (err) {
      console.error(err);
    }
  };
  //--close request modal
  const handleCloseRequestModal = () => {
    setIsRequestModalOpen(false);
    setSearchQuery("");
  };

  // SignalR
  useMusicSignalR(restaurantId, "customer", {
    onPlaybackChanged: (data) => {
      console.log("PLAYBACK EVENT:", data);

      setPlayback(data);
    },

    onPlaylistChanged: async () => {
      await fetchMusic();
    },

    onApproved: async () => {
      await alertModal({
        title: "درخواست تأیید شد",
        message: "موسیقی شما به صف اضافه شد",
        buttonText: "متوجه شدم",
      });

      await fetchMusic();
    },

    onRejected: async () => {
      await alertModal({
        title: "رد شد",
        message: "درخواست شما تأیید نشد",
        buttonText: "متوجه شدم",
      });
    },
  });

  const handleCloseMusicSuccess = () => {
    setShowMusicSuccess(false);
  };

  const handleCopyTrack = async (track) => {
    try {
      await navigator.clipboard.writeText(`${track.title} - ${track.subtitle}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className={`music-page ${isRequestModalOpen ? "is-modal-open" : ""}`}
      dir="rtl"
    >
      <header className="music-page__header">
        <button
          className="music-page__back"
          type="button"
          aria-label="بازگشت"
          onClick={() => navigate(-1)}
        >
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

      <main
        className="music-page__content"
        aria-hidden={isRequestModalOpen || showMusicSuccess}
      >
        <section className="music-page__list" aria-label="لیست آهنگ‌ها">
          {tracks.map((track) => (
            <MusicTrack
              key={track.id}
              title={track.title}
              subtitle={track.subtitle}
              image={track.imageUrl}
              status={
                track.status === "Requested"
                  ? "requested"
                  : track.status === "MineRequested"
                    ? "mineRequested"
                    : null
              }
              active={playback?.currentTrackId === track.id}
              onActionClick={() => handleCopyTrack(track)}
            />
          ))}
        </section>
      </main>

      <footer className="music-page__footer">
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
            onClick={handleOpenRequestModal}
          >
            درخواست موسیقی
          </button>
        )}
      </footer>

      <MusicRequestModal
        open={isRequestModalOpen}
        tracks={requestTracks}
        searchQuery={searchQuery}
        onClose={handleCloseRequestModal}
        selectedTrackId={selectedTrackId}
        onRequestTrack={handleRequestTrack}
      />

      <OrderSuccessModal
        open={showMusicSuccess}
        variant="music"
        iconSrc="/images/music/music-request-success.png"
        title={
          <>
            درخواست شما با موفقیت <span>ثبت شد</span>
          </>
        }
        subtitle="لطفا منتظر تایید رستوران برای درخواستتان بمانید"
        onClose={handleCloseMusicSuccess}
      />
    </div>
  );
}
