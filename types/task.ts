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
    category?: string | null;
    amount?: string | null;
    estimate?: number | null;
    subtasks?: string[];
    notes?: string | null;
    logs: TaskLog[];
    statuses: TaskStatus[];
}

export interface TaskCardProps {
    task: Task;
    refetch: () => void;
    currentMonth: Date;
}
