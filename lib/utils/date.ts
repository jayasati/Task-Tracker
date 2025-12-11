export const formatDateKey = (y: number, m: number, d: number) => {
    // m is 0-indexed
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

export const toISODate = (d: Date | string) => {
    return new Date(d).toISOString().split("T")[0];
};

export const getDateString = (date: Date) => {
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
};

export const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};
