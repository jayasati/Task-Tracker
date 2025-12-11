import React from "react";
import { AddTaskFormState } from "@/hooks/useAddTaskForm";
import { inputClass } from "./styles";

interface AddTaskHeaderProps {
    form: AddTaskFormState;
    updateForm: (field: string, value: any) => void;
    setIsExpanded: (expanded: boolean) => void;
    isPending: boolean;
}

export default function AddTaskHeader({
    form,
    updateForm,
    setIsExpanded,
    isPending,
}: AddTaskHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1 w-full">
                <input
                    required
                    placeholder="Enter task name"
                    className={`${inputClass} text-lg py-4`}
                    value={form.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                    onFocus={() => setIsExpanded(true)}
                />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <select
                    value={form.type}
                    onChange={(e) => updateForm("type", e.target.value)}
                    className={`${inputClass} w-full md:w-48 appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23667eea%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-8`}
                >
                    <option value="task">Task</option>
                    <option value="amount">Amount-based</option>
                    <option value="time">Time-based</option>
                </select>
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:translate-y-[-2px] hover:shadow-indigo-500/25 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    {isPending ? "Adding..." : "Add +"}
                </button>
            </div>
        </div>
    );
}
