import { Status } from "@prisma/client";

export interface TaskLog {
    seconds: number;
    date: string | Date;
}

export interface TaskStatus {
    id: string;
    taskId: string;
    date: string | Date;
    status: Status;
    completedSubtasks: string[];
    dailySubtasks: string[];
    progressLevel: number; // 0-4 level progress tracking
}

export interface Task {
    id: string;
    title: string;
    type: string;
    repeatMode?: string;
    weekdays?: number[];
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    priority?: string;
    category: string; // Required: "task", "make_habit", "break_habit", "professional"
    amount?: string | null;
    estimate?: number | null;
    subtasks?: string[];
    notes?: string | null;
    isCompleted: boolean;
    completedAt?: Date | string | null;
    isArchived: boolean;
    progressLevel?: number; // 0-4 level progress tracking
    createdAt?: Date | string;
    updatedAt?: Date | string;
    logs: TaskLog[];
    statuses: TaskStatus[];
    totalSeconds?: number;
}

export type TaskCardProps = {
    task: Task;
    refetch?: () => void;
    currentMonth: Date;
};

/**
 * FILE: types/task.ts
 * 
 * PURPOSE:
 * Central type definitions for task-related data structures.
 * Provides TypeScript interfaces matching Prisma schema.
 * 
 * WHAT IT DOES:
 * - Defines TimeLog interface for timer entries
 * - Defines TaskStatus interface for daily status tracking
 * - Defines Task interface with all task properties
 * - Defines TaskCardProps for component props
 * - Ensures type safety across application
 * 
 * DEPENDENCIES (imports from):
 * - @prisma/client: Status enum from Prisma
 * 
 * DEPENDENTS (files that import this):
 * - app/components/TaskCard.tsx: Uses TaskCardProps, Task
 * - app/components/TasksListServerRSC.tsx: Uses Task
 * - hooks/useTaskSubtasks.ts: Uses Task
 * - hooks/useHabitGrid.ts: Uses Task
 * - hooks/useSubtaskModal.ts: Uses Task indirectly
 * - server/queries/tasks.ts: Return type matches Task
 * 
 * RELATED FILES:
 * - prisma/schema.prisma: Source of truth for data structure
 * - server/routers/task.ts: Uses these types for validation
 * 
 * NOTES:
 * - Task interface includes computed field: totalSeconds
 * - refetch in TaskCardProps is optional (for server component compatibility)
 * - Status type comes from Prisma: "NONE" | "FAIL" | "HALF" | "SUCCESS"
 * - Arrays (logs, statuses, subtasks, weekdays) can be empty
 * - Optional fields: startDate, endDate, category, amount, estimate, subtasks, notes
 */
