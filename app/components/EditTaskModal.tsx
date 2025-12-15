"use client";
import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { AddTaskFormState } from "@/hooks/useAddTaskForm";

interface EditTaskModalProps {
    task: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditTaskModal({
    task,
    isOpen,
    onClose,
    onSuccess,
}: EditTaskModalProps) {
    const [form, setForm] = useState<Partial<AddTaskFormState>>({});

    const editTask = trpc.task.editTask.useMutation({
        onSuccess: () => {
            onSuccess();
            onClose();
        },
    });

    useEffect(() => {
        if (task && isOpen) {
            setForm({
                title: task.title || "",
                habitType: task.habitType || "",
                repeatMode: task.repeatMode || "none",
                weekdays: task.weekdays || [],
                startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : "",
                endDate: task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : "",
                priority: task.priority || "medium",
                category: task.category || "task",
                amount: task.amount || "",
                estimate: task.estimate?.toString() || "",
                requiredHours: task.requiredMinutes ? (task.requiredMinutes / 60).toString() : "",
                requiredAmount: task.requiredAmount?.toString() || "",
                subtasksStr: task.subtasks?.join(", ") || "",
                notes: task.notes || "",
            });
        }
    }, [task, isOpen]);

    const handleSave = () => {
        if (!form.title?.trim()) {
            alert("Title is required");
            return;
        }

        editTask.mutate({
            id: task.id,
            title: form.title,
            habitType: form.habitType as "" | "time" | "amount" | "both",
            repeatMode: form.repeatMode,
            weekdays: form.weekdays,
            startDate: form.startDate || undefined,
            endDate: form.endDate || undefined,
            priority: form.priority,
            category: form.category,
            amount: form.amount?.trim() || undefined,
            estimate: form.estimate ? parseInt(form.estimate) : undefined,
            requiredMinutes: form.requiredHours ? Math.round(parseFloat(form.requiredHours) * 60) : undefined,
            requiredAmount: form.requiredAmount ? parseInt(form.requiredAmount) : undefined,
            subtasks: form.subtasksStr?.split(",").map(s => s.trim()).filter(Boolean) || [],
            notes: form.notes?.trim() || undefined,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8">
                <h2 className="text-2xl font-bold mb-6">Edit Task</h2>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={form.title || ""}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Habit Type (if applicable) */}
                    {(task.category === "make_habit" || task.category === "professional") && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Habit Type
                            </label>
                            <select
                                value={form.habitType || ""}
                                onChange={(e) => setForm({ ...form, habitType: e.target.value as "" | "time" | "amount" | "both" })}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="time">Time-based</option>
                                <option value="amount">Amount-based</option>
                                <option value="both">Both (Time + Amount)</option>
                            </select>
                        </div>
                    )}

                    {/* Required Hours (if time-based) */}
                    {(form.habitType === "time" || form.habitType === "both") && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Required Hours / Day
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.25"
                                value={form.requiredHours || ""}
                                onChange={(e) => setForm({ ...form, requiredHours: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {/* Required Amount (if amount-based) */}
                    {(form.habitType === "amount" || form.habitType === "both") && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Required Amount / Day
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={form.requiredAmount || ""}
                                onChange={(e) => setForm({ ...form, requiredAmount: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Priority
                        </label>
                        <select
                            value={form.priority || "medium"}
                            onChange={(e) => setForm({ ...form, priority: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={form.startDate || ""}
                            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={form.endDate || ""}
                            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Subtasks */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subtasks (comma-separated)
                        </label>
                        <textarea
                            value={form.subtasksStr || ""}
                            onChange={(e) => setForm({ ...form, subtasksStr: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                        </label>
                        <textarea
                            value={form.notes || ""}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                        disabled={editTask.isPending}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                        disabled={editTask.isPending}
                    >
                        {editTask.isPending ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
