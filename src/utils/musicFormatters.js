// src/utils/musicFormatters.js
// ثابت‌ها و توابع کمکیِ بخش موسیقی — بدون وابستگی به state یا کامپوننت خاصی

export const MAX_TRACKS = 50;
export const MAX_PLAYLISTS = 10; // ظرفیت پلی لیست ها

// تابع کمکی برای فرمت زمان (ثانیه به دقیقه:ثانیه)
export const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

// for tracks duration
export const formatDuration = (duration) => {
  if (!duration) return "--:--";

  const parts = duration.split(":");

  if (parts.length !== 3) return duration;

  const minutes = parts[1];
  const seconds = parts[2].split(".")[0];

  return `${minutes}:${seconds}`;
};

export const withAuthToken = (url) => {
  if (!url) return url;
  const token = localStorage.getItem("accessToken");
  if (!token) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}access_token=${encodeURIComponent(token)}`;
};
