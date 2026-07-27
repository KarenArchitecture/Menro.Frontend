export const formatPersianDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("fa-IR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};