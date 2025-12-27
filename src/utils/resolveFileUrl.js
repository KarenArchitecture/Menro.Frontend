// strips '/api/public' from base and joins relative file paths
const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/api\/public/i, "");

export default function resolveFileUrl(path) {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return BASE + (path.startsWith("/") ? path : `/${path}`);
}
