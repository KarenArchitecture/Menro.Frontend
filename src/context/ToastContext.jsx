// src/context/ToastContext.jsx
import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import "../assets/css/toast.css";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);

    const showToast = useCallback(({ type = "success", message }) => {
        const id = ++idRef.current;
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3200);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
        {children}
        <div className="toast-stack" dir="rtl">
            {toasts.map((t) => (
            <div key={t.id} className={`toast-item toast-${t.type}`}>
                <i
                className={`fa-solid ${
                    t.type === "success" ? "fa-circle-check" : "fa-circle-exclamation"
                }`}
                />
                <span>{t.message}</span>
            </div>
            ))}
        </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside ToastProvider");
    return ctx;
}