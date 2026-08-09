import React from "react";
import { AlertCircle, Inbox, SearchX, Info } from "lucide-react";
import "../../assets/css/state-message.css";

/**
 * Generic state/empty/error message block. Reusable anywhere a list or
 * page can be empty: favorites, comments, search results, restaurant
 * lists, etc. Always keep the page's own header/nav rendered above this —
 * StateMessage only replaces the *content* area, never the whole page.
 *
 * kind: "empty" | "error" | "search" | "info"
 */
const ICONS = {
    error: AlertCircle,
    empty: Inbox,
    search: SearchX,
    info: Info,
};

export default function StateMessage({
    kind = "info",
    title,
    children,
    action,
    compact = false,
    className = "",
    ...rest
}) {
    const Icon = ICONS[kind] || ICONS.info;

    return (
        <div
        className={`state-message state-message--${kind} ${compact ? "compact" : ""} ${className}`}
        role={kind === "error" ? "alert" : "status"}
        {...rest}
        >
        <div className="state-message__icon-orb">
            <Icon className="state-message__icon" />
        </div>

        {title && <h3 className="state-message__title">{title}</h3>}
        {children && <div className="state-message__text">{children}</div>}
        {action && <div className="state-message__action">{action}</div>}
        </div>
    );
}