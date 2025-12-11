import { Status } from "@prisma/client";

export const nextStatus: Record<Status, Status> = {
    NONE: "FAIL",
    FAIL: "HALF",
    HALF: "SUCCESS",
    SUCCESS: "NONE",
};

export const statusLabels: Record<Status, string> = {
    NONE: "Not started",
    FAIL: "Failed",
    HALF: "Partial",
    SUCCESS: "Completed",
};

export const statusIcons: Record<Status, string> = {
    NONE: "",
    FAIL: "✕",
    HALF: "◐",
    SUCCESS: "✓",
};

export function calculateStatusFromSubtasks(total: number, completed: number): Status {
    if (total === 0) return "NONE";
    if (completed === total) return "SUCCESS";
    if (completed > 0) return "HALF";
    return "NONE";
}
