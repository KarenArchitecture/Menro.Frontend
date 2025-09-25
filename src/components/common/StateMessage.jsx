import React from "react";
/**
 * Usage:
 * <StateMessage kind="error">خطایی رخ داد</StateMessage>
 * <StateMessage kind="empty">سفارشی یافت نشد</StateMessage>
 * <StateMessage kind="info">در حال بارگذاری…</StateMessage>
 *
 * Optional props:
 * - title: bold heading line
 * - action: a React node (e.g. a link/button)
 * - compact: boolean (smaller padding if needed)
 */
export default function StateMessage({
    kind = "info",         // "info" | "error" | "empty"
    title,
    children,
    action,
    compact = false,
    className = "",
    ...rest
    }) {
    const classes = [
        "state-block",
        `state-${kind}`,
        compact ? "state-compact" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={classes} role={kind === "error" ? "alert" : "status"} {...rest}>
        <div className="state-block__icon" aria-hidden="true" />
        <div className="state-block__body">
            {title ? <div className="state-block__title">{title}</div> : null}
            {children ? <p className="state-block__text">{children}</p> : null}
            {action ? <div className="state-block__action">{action}</div> : null}
        </div>
        </div>
    );
}
