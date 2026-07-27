// src/utils/defaultAvatar.js
export const DEFAULT_AVATAR =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="50" fill="#2d2f38"/>
        <circle cx="50" cy="40" r="18" fill="#7b8193"/>
        <path d="M20 88c4-22 20-32 30-32s26 10 30 32" fill="#7b8193"/>
        </svg>
    `);