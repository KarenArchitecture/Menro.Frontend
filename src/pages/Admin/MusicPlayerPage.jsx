import { useMusicHubEvents } from "../../hooks/useMusicHubEvents";
import useDocumentTitle from "../../hooks/useDocumentTitle";

import MusicHeader from "../../components/music/MusicPlayerHeader";

// music player components
import NowPlayingBar from "../../components/musicPlayer/NowPlayingBar";
import MusicArchiveCard from "../../components/musicPlayer/MusicArchiveCard";
import PlaylistCard from "../../components/musicPlayer/PlaylistCard";
import TrackRequestsCard from "../../components/musicPlayer/TrackRequestsCard";

// music player modals
import PlaylistFormModal from "../../components/musicPlayer/PlaylistFormModal";
import TrackFormModal from "../../components/musicPlayer/TrackFormModal";
import PreviewModal from "../../components/musicPlayer/PreviewModal";

// music player hooks
import useTrackRequests from "../../hooks/musicPlayer/useTrackRequests";
import usePreviewPlayer from "../../hooks/musicPlayer/usePreviewPlayer";
import useMusicArchive from "../../hooks/musicPlayer/useMusicArchive";
import usePlaylistManager from "../../hooks/musicPlayer/usePlaylistManager";
import useMusicPlayerEngine from "../../hooks/musicPlayer/useMusicPlayerEngine";

import "../../assets/css/admin/musicSection.css";

// for api
import { getPlayerState } from "../../api/music";

export default function MusicPlayerPage() {
  useDocumentTitle("پخش‌کننده موسیقی");

  /* -------------------------------------------------------------------
     Music Player Hook Calls
  ------------------------------------------------------------------- */
  // usePlaylistManager
  const {
    playlists,
    setPlaylists,
    selectedPlaylistId,
    selectedPlaylistIdRef,
    playlistTracks,
    setPlaylistTracks,
    playlistTracksRef,
    loadingPlaylist,
    showPlaylistModal,
    playlistModalMode,
    playlistFormName,
    setPlaylistFormName,
    refreshPlaylist,
    addToPlaylist,
    handleDeletePlaylist,
    openAddPlaylistModal,
    openEditPlaylistModal,
    closePlaylistModal,
    submitPlaylistModal,
    handleSelectPlaylist,
    movePlaylistTrack,
  } = usePlaylistManager({
    loadPlayerState: async () => {
      const res = await getPlayerState();
      return res.data;
    },
    onInitialPlaybackSync: ({ playlistTrackId, musicTrackId }) => {
      setPlayingPlaylistTrackId(playlistTrackId);
      setPlayingTrackId(musicTrackId);
    },
  });

  // useMusicArchive
  const {
    tracks,
    loadingArchive,
    onUploadFiles,
    uploading,
    uploadProgress,
    uploadFileName,
    uploadIndex,
    uploadTotal,
    deleteTrackFromArchive,
    showTrackModal,
    trackFormName,
    setTrackFormName,
    openEditTrackModal,
    submitTrackModal,
    closeTrackModal,
  } = useMusicArchive({
    onTrackDeleted: (trackId) => {
      setPlaylistTracks((prev) =>
        prev.filter((p) => p.musicTrackId !== trackId),
      );
    },
    onTrackRenamed: async () => {
      if (selectedPlaylistId) {
        await refreshPlaylist(selectedPlaylistId);
      }
    },
  });

  // useMusicPlayerEngine
  const {
    audioRef,
    audioCacheRef,
    playingTrackId,
    playingPlaylistTrackId,
    isPlaying,
    currentTime,
    duration,
    nowPlayingTrack,
    mainProgressPct,
    toggleGlobalPlay,
    playNextTrack,
    playPreviousTrack,
    playPlaylistTrack,
    removeFromPlaylist,
    handleSeekMouseDown,
    handleSeekChange,
    handleSeekMouseUp,
    handlePlaybackChanged,
    setPlayingPlaylistTrackId,
    setPlayingTrackId,
    setIsPlaying,
  } = useMusicPlayerEngine({
    playlistTracks,
    playlistTracksRef,
    selectedPlaylistId,
    selectedPlaylistIdRef,
    refreshPlaylist,
    onTrackCountChanged: (playlistId, count) => {
      setPlaylists((prev) =>
        prev.map((p) => (p.id === playlistId ? { ...p, tracks: count } : p)),
      );
    },
  });

  // usePreviewPlayer
  const {
    showPreviewModal,
    previewTrackTitle,
    isPreviewPlaying,
    previewCurrentTime,
    previewDuration,
    previewProgressPct,
    handlePreviewTrack,
    closePreviewModal,
    togglePreviewPlay,
    handlePreviewSeekMouseDown,
    handlePreviewSeekChange,
    handlePreviewSeekMouseUp,
  } = usePreviewPlayer({
    tracks,
    audioCacheRef,
    onBeforePreviewStart: () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    },
  });

  // useTrackRequests
  const {
    requestedTracks,
    loadingRequests,
    fetchTrackRequests,
    handleApproveRequest,
    handleRejectRequest,
  } = useTrackRequests({
    onApproved: async () => {
      if (selectedPlaylistId) {
        await refreshPlaylist(selectedPlaylistId);
      }
    },
  });

  useMusicHubEvents({
    onCreated: () => fetchTrackRequests(),
    onPlaybackChanged: (playerDto) => handlePlaybackChanged(playerDto),
  });

  /* -------------------------------------------------------------------
     RENDER
  ------------------------------------------------------------------- */
  return (
    <div className="admin-page">
      <MusicHeader />

      <div className="admin-content">
        <div className="music-hub" dir="rtl">
          {/* ---------------------------------
              Now Playing bar
          --------------------------------- */}
          <NowPlayingBar
            nowPlayingTrack={nowPlayingTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            mainProgressPct={mainProgressPct}
            onTogglePlay={toggleGlobalPlay}
            onNext={playNextTrack}
            onPrevious={playPreviousTrack}
            onSeekMouseDown={handleSeekMouseDown}
            onSeekChange={handleSeekChange}
            onSeekMouseUp={handleSeekMouseUp}
          />

          <div className="music-columns">
            {/* ---------------------------------
                آرشیو موسیقی
            --------------------------------- */}
            <MusicArchiveCard
              tracks={tracks}
              loadingArchive={loadingArchive}
              playingTrackId={playingTrackId}
              isPlaying={isPlaying}
              onUploadFiles={onUploadFiles}
              onPreviewTrack={handlePreviewTrack}
              onEditTrack={openEditTrackModal}
              onAddToPlaylist={addToPlaylist}
              onDeleteTrack={deleteTrackFromArchive}
              uploading={uploading}
              uploadProgress={uploadProgress}
              uploadFileName={uploadFileName}
              uploadIndex={uploadIndex}
              uploadTotal={uploadTotal}
            />

            {/* ---------------------------------
                پلی‌لیست ادمین
            --------------------------------- */}
            <PlaylistCard
              playlists={playlists}
              selectedPlaylistId={selectedPlaylistId}
              playlistTracks={playlistTracks}
              loadingPlaylist={loadingPlaylist}
              playingPlaylistTrackId={playingPlaylistTrackId}
              isPlaying={isPlaying}
              onCreatePlaylist={openAddPlaylistModal}
              onEditPlaylist={openEditPlaylistModal}
              onDeletePlaylist={handleDeletePlaylist}
              onSelectPlaylist={handleSelectPlaylist}
              onPlayTrack={playPlaylistTrack}
              onMoveTrack={movePlaylistTrack}
              onRemoveTrack={removeFromPlaylist}
            />
          </div>

          {/* ---------------------------------
              آهنگ‌های درخواستی
          --------------------------------- */}
          <TrackRequestsCard
            requestedTracks={requestedTracks}
            loadingRequests={loadingRequests}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            onRefresh={fetchTrackRequests}
          />

          {/* ------------------------------------------------------------------
          -------------------------------MODALS---------------------------------
          -------------------------------------------------------------------*/}

          {/* مودال ساخت/ویرایش پلی‌لیست (فرم اختصاصی) */}
          <PlaylistFormModal
            isOpen={showPlaylistModal}
            mode={playlistModalMode}
            name={playlistFormName}
            onNameChange={setPlaylistFormName}
            onSubmit={submitPlaylistModal}
            onClose={closePlaylistModal}
          />

          {/* مودال ویرایش نام آهنگ (فرم اختصاصی) */}
          <TrackFormModal
            isOpen={showTrackModal}
            name={trackFormName}
            onNameChange={setTrackFormName}
            onSubmit={submitTrackModal}
            onClose={closeTrackModal}
          />

          {/* مودال پیش‌نمایش آهنگ (پلیر اختصاصی) */}
          <PreviewModal
            isOpen={showPreviewModal}
            trackTitle={previewTrackTitle}
            isPlaying={isPreviewPlaying}
            currentTime={previewCurrentTime}
            duration={previewDuration}
            progressPct={previewProgressPct}
            onTogglePlay={togglePreviewPlay}
            onSeekMouseDown={handlePreviewSeekMouseDown}
            onSeekChange={handlePreviewSeekChange}
            onSeekMouseUp={handlePreviewSeekMouseUp}
            onClose={closePreviewModal}
          />
        </div>
      </div>
    </div>
  );
}
