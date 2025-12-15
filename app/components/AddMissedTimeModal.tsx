"use client";
import { useState } from "react";
import { trpc } from "@/utils/trpc";

interface AddMissedTimeModalProps {
    taskId: string;
    taskTitle: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    date: string; // ISO date string for the 2AM day
}

export default function AddMissedTimeModal({
    taskId,
    taskTitle,
    isOpen,
    onClose,
    onSuccess,
    date,
}: AddMissedTimeModalProps) {
    const [minutes, setMinutes] = useState("");
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

    const addMissedTime = trpc.task.addMissedTime.useMutation({
        onSuccess: () => {
            onSuccess();
            handleClose();
        },
    });

    const handleClose = () => {
        // Stop timer if running
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        setMinutes("");
        setTimerSeconds(0);
        setIsTimerRunning(false);
        setTimerInterval(null);
        onClose();
    };

    const startTimer = () => {
        setIsTimerRunning(true);
        const interval = setInterval(() => {
            setTimerSeconds((prev) => prev + 1);
        }, 1000);
        setTimerInterval(interval);
    };

    const stopTimer = () => {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        setIsTimerRunning(false);
        setTimerInterval(null);
    };

    const handleSave = () => {
        const manualMinutes = parseFloat(minutes) || 0;
        const timerMinutes = timerSeconds / 60;
        const totalSeconds = Math.round((manualMinutes + timerMinutes) * 60);

        if (totalSeconds <= 0) {
            alert("Please enter time or use the timer");
            return;
        }

        addMissedTime.mutate({
            taskId,
            seconds: totalSeconds,
            date,
        });
    };

    if (!isOpen) return null;

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-bold mb-4">Add Missed Time</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Task: <span className="font-medium">{taskTitle}</span>
                </p>

                {/* Mini Timer */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Track Time Now
                    </label>
                    <div className="flex items-center gap-3">
                        <div className="text-2xl font-mono bg-gray-100 px-4 py-2 rounded">
                            {formatTime(timerSeconds)}
                        </div>
                        {!isTimerRunning ? (
                            <button
                                onClick={startTimer}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                            >
                                Start
                            </button>
                        ) : (
                            <button
                                onClick={stopTimer}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                                Stop
                            </button>
                        )}
                    </div>
                </div>

                {/* Manual Input */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Or Enter Minutes Manually
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="e.g., 30"
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Total */}
                <div className="mb-6 p-3 bg-blue-50 rounded">
                    <p className="text-sm font-medium text-gray-700">
                        Total Time to Add:{" "}
                        <span className="text-blue-600">
                            {((parseFloat(minutes) || 0) + timerSeconds / 60).toFixed(2)} minutes
                        </span>
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                        disabled={addMissedTime.isPending}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                        disabled={addMissedTime.isPending}
                    >
                        {addMissedTime.isPending ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}
