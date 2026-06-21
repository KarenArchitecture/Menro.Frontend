export enum OrderStatus {
    Pending = 0,
    Confirmed = 1,
    Cancelled = 2,
    Delivered = 3,
    Paid = 4,
    Completed = 5,
}

// label + css + pill (UI mapping)
export function getStatusMeta(status: keyof typeof OrderStatus | string) {
    switch (status) {
        case "Pending":
            return { pill: "در انتظار تأیید", cls: "status-pending" };

        case "Confirmed":
            return { pill: "در انتظار تحویل", cls: "status-delivery" };

        case "Delivered":
            return { pill: "در انتظار پرداخت", cls: "status-payment" };

        case "Paid":
            return { pill: "پایان سفارش", cls: "status-payment" };

        case "Completed":
            return { pill: "تکمیل شده", cls: "status-archived" };

        case "Cancelled":
            return { pill: "لغو شده", cls: "status-archived" };

        default:
            return { pill: "—", cls: "status-archived" };
    }
}

export function isHistoryStatus(status: string) {
  return status === "Cancelled" || status === "Completed";
}

// فقط برای OrderModal (label ساده)
export function getOrderStatusLabel(status: string) {
    switch (status) {
        case "Pending":
            return "در انتظار تأیید";
        case "Confirmed":
            return "در انتظار تحویل";
        case "Delivered":
            return "تحویل شده";
        case "Paid":
            return "پرداخت شده";
        case "Completed":
            return "تکمیل شده";
        case "Cancelled":
            return "لغو شده";
        default:
            return "—";
    }
}