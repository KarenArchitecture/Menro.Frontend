// src/components/common/SafeImage.jsx
import React, { useEffect, useState } from "react";

export default function SafeImage({ src, fallback, alt = "", className }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  return (
    <img
      src={failed || !src ? fallback : src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}