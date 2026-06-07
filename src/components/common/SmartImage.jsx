import React, { useEffect, useRef, useState } from "react";

export default function SmartImage({
    src,
    alt = "",
    fallback = "",
    className = "",
    style,
    imgRef = null,
    lazy = true,
    fadeDuration = 280,
    onLoad,
    onError,
    ...props
}) {
    const internalRef = useRef(null);
    const targetRef = imgRef || internalRef;

    const [currentSrc, setCurrentSrc] = useState(src || fallback || "");
    const [ready, setReady] = useState(false);
    const [usedFallback, setUsedFallback] = useState(false);

    useEffect(() => {
        setCurrentSrc(src || fallback || "");
        setReady(false);
        setUsedFallback(false);
    }, [src, fallback]);

    const revealImage = async (img, loadedSrc) => {
        try {
            if (img.decode) await img.decode();
        } catch {
            // Ignore decode errors if image is already usable
        }

        if (img.complete && img.naturalWidth > 0) {
            setReady(true);
            onLoad?.(loadedSrc);
        }
    };

    useEffect(() => {
        const img = targetRef?.current;

        if (!img || !currentSrc) return;

        if (img.complete && img.naturalWidth > 0) {
            revealImage(img, currentSrc);
        }
    }, [currentSrc]);

    const handleLoad = (event) => {
        revealImage(event.currentTarget, currentSrc);
    };

    const handleError = () => {
        if (fallback && !usedFallback && currentSrc !== fallback) {
            setUsedFallback(true);
            setReady(false);
            setCurrentSrc(fallback);
            onError?.(src);
            return;
        }

        setReady(false);
        onError?.(src);
    };

    if (!currentSrc) return null;

    return (
        <img
            ref={targetRef}
            {...props}
            src={currentSrc}
            alt={alt}
            className={`smart-image ${ready ? "is-ready" : ""} ${className}`.trim()}
            style={{
                ...style,
                "--smart-image-fade-duration": `${fadeDuration}ms`,
            }}
            decoding="async"
            loading={lazy ? "lazy" : "eager"}
            draggable={false}
            onLoad={handleLoad}
            onError={handleError}
        />
    );
}
