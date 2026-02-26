// src/hooks/usePageStyles.js
import { useEffect, useRef, useState } from "react";

export default function usePageStyles(stylesheetUrl) {
  const [ready, setReady] = useState(false);
  const linkRef = useRef(null);

  useEffect(() => {
    setReady(false);

    // remove any previous element we created
    if (linkRef.current) {
      linkRef.current.remove();
      linkRef.current = null;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = stylesheetUrl;
    link.dataset.pageStyle = "true";

    link.onload = () => setReady(true);
    link.onerror = (err) => {
      console.error("usePageStyles link load failed:", err);
      setReady(true); // fail-open so page still renders
    };

    document.head.appendChild(link);
    linkRef.current = link;

    return () => {
      if (linkRef.current) {
        linkRef.current.remove();
        linkRef.current = null;
      }
    };
  }, [stylesheetUrl]);

  return ready;
}
