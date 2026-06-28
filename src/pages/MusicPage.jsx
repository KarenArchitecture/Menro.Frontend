// MusicPage.jsx

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MusicTrack from "../components/music/MusicTrack";
import MusicRequestModal from "../components/music/MusicRequestModal";
import OrderSuccessModal from "../components/common/OrderSuccessModal";
import { useMusicSignalR } from "../hooks/useMusicSignalR";
import { useModal } from "../components/common/GlobalModal";

import "../assets/css/styles-music.css";

import { getPublicMusic, requestTrack } from "../api/music";

export default function MusicPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const restaurantId = location.state?.restaurantId;

  const [loading, setLoading] = useState(true);

  const [tracks, setTracks] = useState([]);
  const [remainingRequests, setRemainingRequests] = useState(0);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [showMusicSuccess, setShowMusicSuccess] = useState(false);

  const { showModal } = useModal();

  useEffect(() => {
    if (!restaurantId) {
      navigate(-1);
      return;
    }

    fetchMusic();
  }, [restaurantId]);

  const fetchMusic = async () => {
    try {
      setLoading(true);

      const res = await getPublicMusic(restaurantId);

      setTracks(res.data.tracks ?? []);
      setRemainingRequests(res.data.remainingRequests ?? 0);

      const myRequestedTrack = res.data.tracks?.find((x) => x.status === 2);

      setSelectedTrackId(myRequestedTrack?.id ?? null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequestModal = () => {
    //if (remainingRequests <= 0) return;

    setIsRequestModalOpen(true);
  };

  const handleCloseRequestModal = () => {
    setIsRequestModalOpen(false);
    setSearchQuery("");
  };

  // SignalR
  useMusicSignalR(restaurantId, {
    onCreated: (data) => {
      console.log("NEW REQUEST:", data);
    },

    onApproved: async (data) => {
      console.log("APPROVED EVENT RECEIVED:", data);

      showModal({
        title: "درخواست موسیقی تأیید شد",
        message:
          "درخواست موسیقی شما توسط رستوران تأیید شد و به صف پخش اضافه گردید.",
        buttonText: "متوجه شدم",
      });

      await fetchMusic();
    },

    onRejected: (data) => {
      console.log("REJECTED EVENT RECEIVED:", data);

      showModal({
        title: "درخواست موسیقی رد شد",
        message: "متأسفانه رستوران درخواست موسیقی شما را تأیید نکرد.",
        buttonText: "متوجه شدم",
      });
    },
  });

  const handleRequestTrack = async (track) => {
    try {
      await requestTrack(restaurantId, {
        musicTrackId: track.id,
      });

      setIsRequestModalOpen(false);
      setSearchQuery("");
      setShowMusicSuccess(true);

      await fetchMusic();
    } catch (err) {
      console.error(err);
    }
  };

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

  if (loading) {
    return (
      <div className="music-page" dir="rtl">
        در حال بارگذاری...
      </div>
    );
  }

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
              active={track.isCurrentTrack}
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
            //disabled={remainingRequests <= 0}
            onClick={handleOpenRequestModal}
          >
            درخواست موسیقی
          </button>
        )}
      </footer>

      <MusicRequestModal
        open={isRequestModalOpen}
        tracks={tracks}
        searchQuery={searchQuery}
        onClose={handleCloseRequestModal}
        selectedTrackId={selectedTrackId}
        remainingRequests={remainingRequests}
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
