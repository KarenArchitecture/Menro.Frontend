// src/components/common/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router never resets scroll on navigation by itself. This resets
// both the window and the app-shell's own scroll container (which is the
// actual scrolling element on mobile, since .app-shell__content uses
// position:fixed + overflow-y:auto instead of the window scrolling).
export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
        document.querySelector(".app-shell__content")?.scrollTo(0, 0);
    }, [pathname]);

    return null;
}