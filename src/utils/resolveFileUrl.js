// src/utils/resolveFileUrl.js

function getServerOrigin() {
    const raw =
        import.meta.env.VITE_SERVER_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_API_URL ||
        "";

    if (!raw) return window.location.origin;

    try {
        return new URL(raw, window.location.origin).origin;
    } catch {
        return window.location.origin;
    }
    }

    export default function resolveFileUrl(path, fallback = "") {
    if (!path) return fallback;

    const value = String(path).trim();
    if (!value) return fallback;

    // Already absolute or browser-handled URLs
    if (
        /^https?:\/\//i.test(value) ||
        /^data:/i.test(value) ||
        /^blob:/i.test(value)
    ) {
        return value;
    }

    // Protocol-relative URL: //cdn.example.com/file.jpg
    if (value.startsWith("//")) {
        return `${window.location.protocol}${value}`;
    }

    const withSlash = value.startsWith("/") ? value : `/${value}`;

    const appOrigin = window.location.origin;
    const serverOrigin = getServerOrigin();

    // Backend public path like /api/public/img/a.jpg
    if (withSlash.startsWith("/api/public/")) {
        return `${serverOrigin}${withSlash.replace(/^\/api\/public/i, "")}`;
    }

    // Backend uploaded files
    if (withSlash.startsWith("/img/")) {
        return `${serverOrigin}${withSlash}`;
    }

    // Frontend public folder
    if (withSlash.startsWith("/images/")) {
        return `${appOrigin}${withSlash}`;
    }

    // Default: frontend-relative asset
    return `${appOrigin}${withSlash}`;
}
