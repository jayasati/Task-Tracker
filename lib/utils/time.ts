export const formatTime = (s: number): string =>
    new Date(s * 1000).toISOString().substring(11, 19);
