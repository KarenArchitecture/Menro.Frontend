import React from "react";
import { AlertCircle, Info, Inbox } from "lucide-react";
import "../../assets/css/state-message.css";

/**
 * Usage:
 * <StateMessage kind="error" title="خطا">متن خطا</StateMessage>
 * <StateMessage kind="empty" title="خالی">موردی یافت نشد</StateMessage>
 * <StateMessage kind="info" title="در حال بارگذاری">صبر کنید...</StateMessage>
 */

export default function StateMessage({
    kind = "info",
    title,
    children,
    action,
    compact = false,
    className = "",
    ...rest
    }) {
    const icons = {
        error: <AlertCircle className="state-icon error" />,
        empty: <Inbox className="state-icon empty" />,
        info: <Info className="state-icon info" />,
    };

    return (
        <div
        className={`state-message ${kind} ${compact ? "compact" : ""} ${className}`}
        role={kind === "error" ? "alert" : "status"}
        {...rest}
        >
        <div className="state-message__icon-wrapper">{icons[kind]}</div>

        {title && <h3 className="state-message__title">{title}</h3>}

        {children && <div className="state-message__text">{children}</div>}

        {action && <div className="state-message__action">{action}</div>}
        </div>
    );
}
