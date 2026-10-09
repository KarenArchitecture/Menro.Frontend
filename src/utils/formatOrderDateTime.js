// src/utils/formatOrderDateTime.js
const TZ = "Asia/Tehran";

// بک‌اند DateTime را UTC می‌فرستد؛ اگر Z نداشت اضافه می‌کنیم تا مرورگر آن را
// «ساعت محلی» حساب نکند.
const parseUtc = (value) => {
  if (!value) return null;
  let s = String(value);
  if (!/(Z|[+-]\d{2}:?\d{2})$/i.test(s)) s += "Z";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatOrderDateTime = (value) => {
  const d = parseUtc(value);
  if (!d) return "";
  const date = new Intl.DateTimeFormat("fa-IR", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
  const time = new Intl.DateTimeFormat("fa-IR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return `${date} - ${time}`;
};