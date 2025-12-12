import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";

export type TaskType = "task" | "amount" | "time";

export interface AddTaskFormState {
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

export function useAddTaskForm() {
    const [isExpanded, setIsExpanded] = useState(false);
    const router = useRouter();

    const [form, setForm] = useState<AddTaskFormState>({
        title: "",
        type: "task",
        repeatMode: "none",
        weekdays: [],
        startDate: "",
        endDate: "",
        priority: "medium",
        category: "",
        amount: "",
        estimate: "",
        subtasksStr: "",
        notes: ""
    });

    const addTask = trpc.task.addTask.useMutation({
        onSuccess: () => {
            setForm({
                title: "",
                type: "task",
                repeatMode: "none",
                weekdays: [],
                startDate: "",
                endDate: "",
                priority: "medium",
                category: "",
                amount: "",
                estimate: "",
                subtasksStr: "",
                notes: ""
            });
            setIsExpanded(false);
            // Refresh server component to show new task
            router.refresh();
        },
    });

    const updateForm = (field: string, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
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
            category: form.category.trim() || undefined,
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
