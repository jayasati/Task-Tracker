import { isProfessionalCategory } from "../utils/filters";

export type ModeType = 'task' | 'make_habit' | 'break_habit' | 'professional';

export interface ModeConfig {
    color: string;
    accentColor: string;
    bgGradient: string;
    focusRing: string;
    buttonBg: string;
    buttonHover: string;
    icon: string;
    title: string;
    description: string;
    placeholders: {
        title: string;
        amount?: string;
        estimate?: string;
        subtasks?: string;
        notes?: string;
    };
    labels: {
        amount?: string;
        estimate?: string;
        dateField?: string;
    };
    buttonText: string;
    helperText?: string;
    fields: {
        showRepeat: boolean;
        showDateRange: boolean;
        showSingleDate: boolean;
        showPriority: boolean;
        showCategory: boolean;
        showAmount: boolean;
        showEstimate: boolean;
        showSubtasks: boolean;
        showNotes: boolean;
        showReminder?: boolean;
        showTriggerTime?: boolean;
        showOutcome?: boolean;
    };
}

export const MODE_CONFIG: Record<ModeType, ModeConfig> = {
    task: {
        color: 'blue',
        accentColor: '#3b82f6',
        bgGradient: 'from-blue-500 to-blue-600',
        focusRing: 'focus:ring-blue-500 focus:border-blue-500',
        buttonBg: 'bg-blue-600',
        buttonHover: 'hover:bg-blue-700',
        icon: '📝',
        title: 'Task',
        description: 'One-time or short-term work to complete',
        placeholders: {
            title: 'Finish DB schema design',
            subtasks: 'e.g. Design tables, Add indexes, Write migrations',
            notes: 'Add any extra details here...',
        },
        labels: {
            dateField: 'Due Date',
        },
        buttonText: 'Add Task',
        fields: {
            showRepeat: false,
            showDateRange: false,
            showSingleDate: true,
            showPriority: true,
            showCategory: false,
            showAmount: false,
            showEstimate: false,
            showSubtasks: true,
            showNotes: true,
        },
    },
    make_habit: {
        color: 'green',
        accentColor: '#10b981',
        bgGradient: 'from-green-500 to-emerald-600',
        focusRing: 'focus:ring-green-500 focus:border-green-500',
        buttonBg: 'bg-green-600',
        buttonHover: 'hover:bg-green-700',
        icon: '✅',
        title: 'Make Habit',
        description: 'Build a positive routine through consistency',
        placeholders: {
            title: 'Read 10 pages daily',
            amount: 'e.g., 2L, 30 min, 10 pages',
            notes: 'Why is this habit important to you?',
        },
        labels: {
            amount: 'Target',
            dateField: 'Start Date',
        },
        buttonText: 'Start Habit',
        helperText: 'Small actions done daily lead to big results',
        fields: {
            showRepeat: true,
            showDateRange: true,
            showSingleDate: false,
            showPriority: false,
            showCategory: false,
            showAmount: true,
            showEstimate: false,
            showSubtasks: false,
            showNotes: true,
            showReminder: true,
        },
    },
    break_habit: {
        color: 'red',
        accentColor: '#ef4444',
        bgGradient: 'from-red-500 to-rose-600',
        focusRing: 'focus:ring-red-500 focus:border-red-500',
        buttonBg: 'bg-red-600',
        buttonHover: 'hover:bg-red-700',
        icon: '🚫',
        title: 'Break Habit',
        description: 'Track and reduce unwanted behaviors',
        placeholders: {
            title: 'Avoid junk food',
            amount: 'e.g., 1 cigarette, 30 min screen time',
            estimate: 'e.g., 1',
            notes: 'What triggers this habit? How will you avoid it?',
        },
        labels: {
            amount: 'Limit',
            estimate: 'Max allowed per day',
            dateField: 'Start Date',
        },
        buttonText: 'Start Breaking',
        helperText: 'Track and reduce to build better habits',
        fields: {
            showRepeat: true,
            showDateRange: true,
            showSingleDate: false,
            showPriority: false,
            showCategory: false,
            showAmount: true,
            showEstimate: true,
            showSubtasks: false,
            showNotes: true,
            showTriggerTime: true,
        },
    },
    professional: {
        color: 'indigo',
        accentColor: '#6366f1',
        bgGradient: 'from-indigo-600 to-purple-700',
        focusRing: 'focus:ring-indigo-500 focus:border-indigo-500',
        buttonBg: 'bg-indigo-600',
        buttonHover: 'hover:bg-indigo-700',
        icon: '💼',
        title: 'Professional',
        description: 'Work-related goals, deliverables, or KPIs',
        placeholders: {
            title: 'Prepare client presentation',
            estimate: 'e.g., 4',
            notes: 'Additional context or requirements...',
        },
        labels: {
            estimate: 'Effort (hours)',
            dateField: 'Deadline',
        },
        buttonText: 'Add Work Item',
        fields: {
            showRepeat: true,
            showDateRange: true,
            showSingleDate: false,
            showPriority: true,
            showCategory: true,
            showAmount: false,
            showEstimate: true,
            showSubtasks: false,
            showNotes: true,
            showOutcome: true,
        },
    },
};

export function getModeConfig(category: string): ModeConfig {
    const normalized = (category || '').toLowerCase();

    if (isProfessionalCategory(normalized)) {
        return MODE_CONFIG.professional;
    }

    return MODE_CONFIG[normalized as ModeType] || MODE_CONFIG.task;
}
