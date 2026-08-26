// src/hooks/musicPlayer/useMusicPlayerEngine.js
import { useEffect, useRef, useState } from "react";
import { useGlobalUI } from "../../components/common/GlobalUI";
import {
  getTrack,
  setCurrentTrack,
  advanceTrack,
  previousTrack,
  removeTrackFromPlaylist,
} from "../../api/music";
import { withAuthToken } from "../../utils/musicFormatters";

export default function useMusicPlayerEngine({
  playlistTracks,
  playlistTracksRef,
  selectedPlaylistId,
  selectedPlaylistIdRef,
  refreshPlaylist,
  onTrackCountChanged,
}) {
  const { notify } = useGlobalUI();

  const audioRef = useRef(null);
  const audioCacheRef = useRef({});
  const isSeekingRef = useRef(false);
  const [playerState, setPlayerState] = useState(null);

  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [playingPlaylistTrackId, setPlayingPlaylistTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const playingPlaylistTrackIdRef = useRef(null);

  useEffect(() => {
    playingPlaylistTrackIdRef.current = playingPlaylistTrackId;
  }, [playingPlaylistTrackId]);

  const getCurrentTrack = () => {
    return (
      playlistTracks.find((x) => x.id === playingPlaylistTrackIdRef.current) ||
      playlistTracks[0] ||
      null
    );
  };

  const ensureTrackLoaded = async (track) => {
    if (!track) return false;

    const audio = audioRef.current;
    if (!audio) return false;

    const url =
      audioCacheRef.current[track.musicTrackId] ??
      (await getTrack(track.musicTrackId)).data.audioUrl;

    audioCacheRef.current[track.musicTrackId] = url;

    audio.pause();
    audio.src = withAuthToken(url);
    audio.load();

    return true;
  };

  const playTrack = async (track) => {
    if (!track) return;

    try {
      const ok = await ensureTrackLoaded(track);
      if (!ok) return;

      await audioRef.current.play();
      setIsPlaying(true);
      setPlayingTrackId(track.musicTrackId);
      setPlayingPlaylistTrackId(track.id);
    } catch (err) {
      console.error("PLAY FAILED:", err);
      notify({ type: "error", message: "پخش آهنگ ناموفق بود" });
    }
  };

  const syncAndPlay = async (track, direction) => {
    if (!track) return;

    if (direction === "prev") {
      await previousTrack({ playlistTrackId: track.id });
    } else {
      await advanceTrack({ playlistTrackId: track.id });
    }

    await refreshPlaylist(selectedPlaylistIdRef.current);

    await playTrack(track);
  };

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const updateTime = () => {
      if (!isSeekingRef.current) {
        setCurrentTime(audio.currentTime);
      }
    };

    const updateDuration = () => setDuration(audio.duration);

    const handleEnded = async () => {
      const tracks = playlistTracksRef.current;
      const currentId = playingPlaylistTrackIdRef.current;

      const currentIndex = tracks.findIndex((x) => x.id === currentId);

      if (currentIndex === -1) return;

      const nextTrack = tracks[currentIndex + 1];

      if (!nextTrack) return;

      try {
        await syncAndPlay(nextTrack, "next");

        if (selectedPlaylistIdRef.current) {
          await refreshPlaylist(selectedPlaylistIdRef.current);
        }
      } catch (err) {
        console.error(err);
        notify({ type: "error", message: "پخش آهنگ بعدی با خطا مواجه شد" });
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);

      // موقع خروج کامل از صفحه‌ی موزیک (unmount)، پخش واقعاً متوقف بشه —
      // وگرنه Audio element مستقل از React زنده می‌ماند و پخش ادامه می‌یابد
      audio.pause();
      audio.src = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleGlobalPlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    const currentTrack = getCurrentTrack();

    if (!currentTrack) return;

    if (!audio.src) {
      await playTrack(currentTrack);
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.error(err);
        notify({ type: "error", message: "پخش موسیقی ناموفق بود" });
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const playPlaylistTrack = async (
    playlistTrackId,
    musicTrackId,
    syncPlayerState = true,
  ) => {
    try {
      const audio = audioRef.current;
      if (!audio) return;

      const isSameTrack = playingPlaylistTrackIdRef.current === playlistTrackId;

      if (isSameTrack) {
        if (audio.paused) {
          const p = audio.play();
          if (p?.catch) p.catch(console.log);
          setIsPlaying(true);
        } else {
          audio.pause();
          setIsPlaying(false);
        }
        return;
      }

      if (syncPlayerState) {
        await setCurrentTrack({
          playlistId: selectedPlaylistId,
          playlistTrackId,
        });
      }

      const audioUrl =
        audioCacheRef.current[musicTrackId] ??
        (await getTrack(musicTrackId)).data.audioUrl;

      audioCacheRef.current[musicTrackId] = audioUrl;

      if (!audioUrl) return;

      audio.pause();
      audio.currentTime = 0;

      audio.src = withAuthToken(audioUrl);

      const p = audio.play();

      if (p?.catch) {
        p.catch((err) => {
          console.error("PLAY FAILED:", err);
        });
      }

      setPlayingPlaylistTrackId(playlistTrackId);
      setPlayingTrackId(musicTrackId);
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
      notify({ type: "error", message: "پخش آهنگ ناموفق بود" });
    }
  };

  const getCurrentPlaylistTrackIndex = () => {
    return playlistTracks.findIndex(
      (x) => x.id === playingPlaylistTrackIdRef.current,
    );
  };

  const playNextTrack = async () => {
    try {
      const currentIndex = getCurrentPlaylistTrackIndex();

      if (currentIndex === -1) {
        const firstTrack = playlistTracks?.[0];
        await syncAndPlay(firstTrack, "next");
        return;
      }

      const nextTrack = playlistTracks[currentIndex + 1];

      if (!nextTrack) return;

      await syncAndPlay(nextTrack, "next");
    } catch (err) {
      console.error(err);
      notify({ type: "error", message: "پخش آهنگ بعدی ناموفق بود" });
    }
  };

  const playPreviousTrack = async () => {
    try {
      const currentIndex = getCurrentPlaylistTrackIndex();

      if (currentIndex <= 0) return;

      const previousTrackItem = playlistTracks[currentIndex - 1];

      await syncAndPlay(previousTrackItem, "prev");
    } catch (err) {
      console.error(err);
      notify({ type: "error", message: "پخش آهنگ قبلی ناموفق بود" });
    }
  };

  const removeFromPlaylist = async (playlistTrackId) => {
    if (!selectedPlaylistId) return;

    try {
      const oldTracks = [...playlistTracksRef.current];

      const removedIndex = oldTracks.findIndex((x) => x.id === playlistTrackId);

      const isCurrentlyPlaying =
        playlistTrackId === playingPlaylistTrackIdRef.current;

      await removeTrackFromPlaylist(selectedPlaylistId, playlistTrackId);

      const updatedTracks = await refreshPlaylist(selectedPlaylistId);

      if (onTrackCountChanged) {
        onTrackCountChanged(selectedPlaylistId, updatedTracks.length);
      }

      notify({ type: "success", message: "آهنگ از پلی‌لیست حذف شد" });

      if (!isCurrentlyPlaying) return;

      if (!updatedTracks.length) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
        }

        setPlayingTrackId(null);
        setPlayingPlaylistTrackId(null);
        setIsPlaying(false);
        setCurrentTime(0);

        return;
      }

      let trackToPlay = updatedTracks[removedIndex];

      if (!trackToPlay) {
        trackToPlay = updatedTracks[updatedTracks.length - 1];
      }

      if (!trackToPlay) return;

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = "";
      }

      setPlayingTrackId(null);
      setPlayingPlaylistTrackId(null);
      setIsPlaying(false);

      await playPlaylistTrack(trackToPlay.id, trackToPlay.musicTrackId);
    } catch (err) {
      console.error(err);
      notify({ type: "error", message: "حذف از پلی‌لیست ناموفق بود" });
    }
  };

  const handleSeekMouseDown = () => {
    isSeekingRef.current = true;
  };
  const handleSeekChange = (e) => {
    setCurrentTime(Number(e.target.value));
  };
  const handleSeekMouseUp = (e) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(e.target.value);
    }
    isSeekingRef.current = false;
  };

  const handlePlaybackChanged = async (playerDto) => {
    try {
      setPlayerState(playerDto);

      if (!playerDto?.currentTrackId) {
        audioRef.current?.pause();

        setPlayingTrackId(null);
        setPlayingPlaylistTrackId(null);
        setIsPlaying(false);
        setCurrentTime(0);

        return;
      }
      const tracks = await refreshPlaylist(selectedPlaylistIdRef.current);
      const nextTrack = tracks?.find((x) => x.id === playerDto.currentTrackId);

      if (!nextTrack) return;

      await playTrack(nextTrack);
    } catch (err) {
      console.error(err);
    }
  };

  const nowPlayingTrack = playlistTracks.find(
    (t) => t.id === playingPlaylistTrackId,
  );
  const mainProgressPct = duration ? (currentTime / duration) * 100 : 0;

  return {
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
  };
}
