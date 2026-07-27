export const toPersianDigits = (value) => {
    if (value === null || value === undefined) return "";

    return String(value)
        .replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[digit])
        .replace(/,/g, "٬")
        .replace(/\./g, "٫");
};

export const formatPersianNumber = (value, options = {}) => {
    if (value === null || value === undefined || value === "") return "";

    const number = Number(value);

    if (Number.isNaN(number)) {
        return toPersianDigits(value);
    }

    return new Intl.NumberFormat("fa-IR", options).format(number);
};

export const formatPersianRating = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) return "نامشخص";

    return new Intl.NumberFormat("fa-IR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
        useGrouping: false,
    }).format(number);
};

