import React, { useEffect, useRef, useState } from "react";

export default function SmartImage({
    src,
    alt = "",
    fallback = "",
    className = "",
    style,
    imgRef = null,
    lazy = true,
    rootMargin = "200px",
    threshold = 0.01,
    fadeDuration = 280,
    onLoad,
    onError,
    ...props
    }) {
    const internalRef = useRef(null);
    const targetRef = imgRef || internalRef;

    const [shouldLoad, setShouldLoad] = useState(!lazy);
    const [displaySrc, setDisplaySrc] = useState("");
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setReady(false);
        setDisplaySrc("");
        setShouldLoad(!lazy);
    }, [src, lazy]);

    useEffect(() => {
        if (!lazy) return;
        if (!targetRef?.current) return;

        const el = targetRef.current;

        if (!("IntersectionObserver" in window)) {
        setShouldLoad(true);
        return;
        }

        const observer = new IntersectionObserver(
        (entries) => {
            const entry = entries[0];
            if (entry?.isIntersecting || entry?.intersectionRatio > 0) {
            setShouldLoad(true);
            observer.disconnect();
            }
        },
        {
            root: null,
            rootMargin,
            threshold,
        }
        );

        observer.observe(el);

        return () => observer.disconnect();
    }, [lazy, rootMargin, threshold, targetRef, src]);

    useEffect(() => {
        if (!shouldLoad || !src) return;

        let cancelled = false;

        const preloadImage = (url) =>
        new Promise((resolve, reject) => {
            const img = new Image();

            if (props.crossOrigin) img.crossOrigin = props.crossOrigin;
            if (props.referrerPolicy) img.referrerPolicy = props.referrerPolicy;

            img.src = url;

            const success = () => {
            if (cancelled) return;
            resolve(url);
            };

            const fail = () => {
            if (cancelled) return;
            reject(new Error(`Failed to load image: ${url}`));
            };

            if (img.decode) {
            img
                .decode()
                .then(() => {
                if (img.complete && img.naturalWidth > 0) {
                    success();
                } else {
                    fail();
                }
                })
                .catch(() => {
                if (img.complete && img.naturalWidth > 0) {
                    success();
                } else {
                    img.onload = success;
                    img.onerror = fail;
                }
                });
            } else {
            img.onload = success;
            img.onerror = fail;
            }
        });

        const run = async () => {
        try {
            const loadedSrc = await preloadImage(src);
            if (cancelled) return;

            setDisplaySrc(loadedSrc);
            setReady(true);
            onLoad?.(loadedSrc);
        } catch {
            if (!fallback) {
            if (!cancelled) {
                setDisplaySrc("");
                setReady(false);
                onError?.(src);
            }
            return;
            }

            try {
            const loadedFallback = await preloadImage(fallback);
            if (cancelled) return;

            setDisplaySrc(loadedFallback);
            setReady(true);
            onError?.(src);
            } catch {
            if (cancelled) return;
            setDisplaySrc("");
            setReady(false);
            onError?.(src);
            }
        }
        };

        run();

        return () => {
        cancelled = true;
        };
    }, [shouldLoad, src, fallback, onLoad, onError, props.crossOrigin, props.referrerPolicy]);

    return (
        <img
        ref={targetRef}
        {...props}
        src={displaySrc || undefined}
        alt={alt}
        className={`smart-image ${ready ? "is-ready" : ""} ${className}`.trim()}
        style={{
            ...style,
            "--smart-image-fade-duration": `${fadeDuration}ms`,
        }}
        decoding="async"
        loading={lazy ? "lazy" : "eager"}
        draggable={false}
        />
    );
}
