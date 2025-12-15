import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { ModeType } from "@/lib/config/modeConfig";

export type TaskType = "task" | "amount" | "time" | "habit";

export interface AddTaskFormState {
    mode: ModeType;
    title: string;
    type: TaskType;
    repeatMode: string;
    weekdays: number[];
    startDate: string;
    endDate: string;
    priority: string;
    category: string;
    amount: string;
    estimate: string;
    subtasksStr: string;
    notes: string;
}

// Helper to map tab names to category values
const mapTabToCategory = (tab: string): ModeType => {
    switch (tab) {
        case 'make_habit':
            return 'make_habit';
        case 'break_habit':
            return 'break_habit';
        case 'professional':
            return 'professional';
        case 'task':
            return 'task';
        case 'today':
        case 'reports':
        default:
            return 'task'; // Default to task for Today and Reports tabs
    }
};

const defaultTypeForMode = (mode: ModeType): TaskType => {
    return mode === 'professional' ? 'habit' : 'task';
};

export function useAddTaskForm(activeTab: string) {
    const [isExpanded, setIsExpanded] = useState(false);
    const utils = trpc.useUtils();

    const initialMode = mapTabToCategory(activeTab);

    const [form, setForm] = useState<AddTaskFormState>({
        mode: initialMode,
        title: "",
        type: defaultTypeForMode(initialMode),
        repeatMode: initialMode === 'task' ? 'none' : 'daily',
        weekdays: [],
        startDate: "", // Will be set in useEffect to avoid hydration mismatch
        endDate: "",
        priority: "medium",
        category: initialMode === 'professional' ? "" : initialMode, // Custom for professional, preset for others
        amount: "",
        estimate: "",
        subtasksStr: "",
        notes: ""
    });

    // Set today's date on client side only to avoid hydration mismatch
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setForm(prev => ({
            ...prev,
            startDate: prev.startDate || today
        }));
    }, []);

    // Sync mode/category with active tab when it changes
    useEffect(() => {
        const newMode = mapTabToCategory(activeTab);
        setForm(prev => ({
            ...prev,
            mode: newMode,
            category: newMode === 'professional' ? prev.category : newMode,
            type: defaultTypeForMode(newMode),
            // Also update repeatMode based on mode
            repeatMode: newMode === 'task' ? 'none' : (prev.repeatMode === 'none' ? 'daily' : prev.repeatMode)
        }));
    }, [activeTab]);

    const addTask = trpc.task.addTask.useMutation({
        onSuccess: () => {
            const today = new Date().toISOString().split('T')[0];
            const resetMode = mapTabToCategory(activeTab);
            setForm({
                mode: resetMode,
                title: "",
                type: defaultTypeForMode(resetMode),
                repeatMode: resetMode === 'task' ? 'none' : 'daily',
                weekdays: [],
                startDate: today,
                endDate: "",
                priority: "medium",
                category: resetMode === 'professional' ? "" : resetMode,
                amount: "",
                estimate: "",
                subtasksStr: "",
                notes: ""
            });
            setIsExpanded(false);
            // Invalidate and refetch tasks
            utils.task.getTasks.invalidate();
        },
    });

    const updateForm = (field: string, value: any) => {
        setForm(prev => {
            const updated = { ...prev, [field]: value };

            // Auto-set repeatMode when category changes
            if (field === 'category') {
                if (value === 'task') {
                    // Task category should be for irregular tasks only
                    updated.repeatMode = 'none';
                } else {
                    // Habit categories should have a repeat mode
                    // If currently 'none', set to 'daily' as default
                    if (prev.repeatMode === 'none') {
                        updated.repeatMode = 'daily';
                    }
                }
            }

            return updated;
        });
    };

    const toggleWeekday = (day: number) => {
        setForm(prev => ({
            ...prev,
            weekdays: prev.weekdays.includes(day)
                ? prev.weekdays.filter(d => d !== day)
                : [...prev.weekdays, day]
        }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) return;

        addTask.mutate({
            title: form.title,
            type: form.type,
            repeatMode: form.repeatMode,
            weekdays: form.weekdays,
            startDate: form.startDate || undefined,
            endDate: form.endDate || undefined,
            priority: form.priority,
            category: form.category || form.mode,
            amount: form.amount.trim() || undefined,
            estimate: form.estimate ? parseInt(form.estimate) : undefined,
            subtasks: form.subtasksStr.split(",").map(s => s.trim()).filter(Boolean),
            notes: form.notes.trim() || undefined,
        });
    };

    return { form, updateForm, toggleWeekday, submit, isExpanded, setIsExpanded, isPending: addTask.isPending };
}

/**
 * FILE: hooks/useAddTaskForm.ts
 * 
 * PURPOSE:
 * Custom hook that manages the state and logic for the AddTask form.
 * Handles form data, validation, submission, and UI state.
 * 
 * WHAT IT DOES:
 * - Manages form state for all task fields (title, type, priority, etc.)
 * - Provides updateForm function to update individual fields
 * - Handles weekday selection with toggleWeekday function
 * - Submits task data via TRPC mutation
 * - Resets form and collapses on successful submission
 * - Uses router.refresh() to revalidate server components
 * - Tracks form expansion state and pending status
 * 
 * DEPENDENCIES (imports from):
 * - react: useState hook
 * - @/utils/trpc: TRPC client for mutations
 * - next/navigation: useRouter for page refresh
 * 
 * DEPENDENTS (files that import this):
 * - app/components/AddTask.tsx: Main consumer of this hook
 * 
 * RELATED FILES:
 * - server/routers/task.ts: Defines addTask mutation endpoint
 * - app/components/add-task/*: Form section components
 * 
 * NOTES:
 * - Form state includes: title, type, repeatMode, weekdays, dates, priority,
 *   category, amount, estimate, subtasksStr, notes
 * - subtasksStr is comma-separated string, split before submission
 * - Empty/whitespace-only titles are rejected
 * - router.refresh() triggers server component revalidation
 * - isExpanded controls form visibility (collapsed by default)
 */
