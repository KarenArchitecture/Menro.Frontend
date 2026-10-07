// src/notifications/notificationConfig.js
export const NOTIFICATION_TYPES = {
  music_request: {
    title: "درخواست جدید موسیقی",
    message: "یک درخواست جدید موسیقی از طرف مشتری ثبت شده است.",
    path: "/admin/music", // ← با route واقعی صفحه موزیک عوض کن
  },
  order: {
    title: "سفارش جدید",
    message: "یک سفارش جدید ثبت شده است.",
    path: "/admin?tab=orders", // بعداً که تب‌ها رو query-based کردیم
  },
};
