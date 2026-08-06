export function toPersianDigits(value) {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(value).replace(/[0-9]/g, (d) => persianDigits[Number(d)]);
}

export function apiErrorMessage(err, fallback = "خطایی رخ داد. دوباره تلاش کنید.") {
  if (err?.response?.status === 403) {
    return "شما اجازه‌ی انجام این عملیات را ندارید.";
  }
  return err?.response?.data?.message || err?.response?.data?.title || fallback;
}
