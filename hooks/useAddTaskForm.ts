import { useState } from "react";
import { trpc } from "@/utils/trpc";

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
    const utils = trpc.useUtils();

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
            utils.task.getTasks.invalidate();
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
