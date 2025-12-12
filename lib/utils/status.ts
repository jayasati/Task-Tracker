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

/**
 * FILE: lib/utils/status.ts
 * 
 * PURPOSE:
 * Utility functions and constants for task status management.
 * Defines status transitions, labels, icons, and calculations.
 * 
 * WHAT IT DOES:
 * - nextStatus: Maps each status to its next state in the cycle
 * - statusLabels: Human-readable labels for each status
 * - statusIcons: Icon characters for each status
 * - calculateStatusFromSubtasks: Determines status based on completion ratio
 * 
 * DEPENDENCIES (imports from):
 * - @prisma/client: Status enum type
 * 
 * DEPENDENTS (files that import this):
 * - hooks/useHabitGrid.ts: Uses nextStatus, statusLabels, statusIcons
 * - hooks/useSubtaskModal.ts: Uses calculateStatusFromSubtasks
 * - hooks/useTaskSubtasks.ts: Uses status calculation logic
 * 
 * NOTES:
 * - Status cycle: NONE → FAIL → HALF → SUCCESS → NONE
 * - calculateStatusFromSubtasks: 0% = NONE, 100% = SUCCESS, partial = HALF
 * - Icons: ✕ (fail), ◐ (half), ✓ (success), empty (none)
 * - Status enum from Prisma ensures type safety
 */
