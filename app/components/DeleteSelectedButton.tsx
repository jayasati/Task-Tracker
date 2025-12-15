"use client";
import { trpc } from "@/utils/trpc";
import { useState } from "react";

interface DeleteSelectedButtonProps {
    selectedTasks: Array<{ id: string; title: string }>;
    onSuccess: () => void;
}

export default function DeleteSelectedButton({
    selectedTasks,
    onSuccess,
}: DeleteSelectedButtonProps) {
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const deleteMultiple = trpc.task.deleteMultipleTasks.useMutation({
        onSuccess: () => {
            onSuccess();
            setShowConfirmModal(false);
        },
    });

    const handleDelete = () => {
        deleteMultiple.mutate({
            taskIds: selectedTasks.map((t) => t.id),
        });
    };

    if (selectedTasks.length === 0) return null;

    return (
        <>
            <button
                onClick={() => setShowConfirmModal(true)}
                className="fixed bottom-6 right-6 px-6 py-3 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors font-medium z-40"
            >
                Delete Selected ({selectedTasks.length})
            </button>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4 text-red-600">
                            Confirm Delete
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Are you sure you want to delete {selectedTasks.length} task(s)? This action cannot be undone.
                        </p>

                        {/* List of tasks to be deleted */}
                        <div className="mb-6 max-h-48 overflow-y-auto">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                Tasks to be deleted:
                            </p>
                            <ul className="space-y-1">
                                {selectedTasks.map((task) => (
                                    <li
                                        key={task.id}
                                        className="text-sm text-gray-600 pl-4 border-l-2 border-red-300"
                                    >
                                        {task.title}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                                disabled={deleteMultiple.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                                disabled={deleteMultiple.isPending}
                            >
                                {deleteMultiple.isPending ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
