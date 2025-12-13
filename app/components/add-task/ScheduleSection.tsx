import React from "react";
import { AddTaskFormState } from "@/hooks/useAddTaskForm";
import { getInputClass, labelClass } from "./styles";
import { getModeConfig } from "@/lib/config/modeConfig";

interface ScheduleSectionProps {
    form: AddTaskFormState;
    updateForm: (field: string, value: any) => void;
    toggleWeekday: (day: number) => void;
}

export default function ScheduleSection({
    form,
    updateForm,
    toggleWeekday,
}: ScheduleSectionProps) {
    const config = getModeConfig(form.category);
    const inputClass = getInputClass(form.category);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {config.fields.showRepeat && (
                <div>
                    <label className={labelClass}>Repeat</label>
                    <select
                        value={form.repeatMode}
                        onChange={(e) => updateForm("repeatMode", e.target.value)}
                        className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-8 cursor-pointer`}
                    >
                        <option value="none">None</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="custom">Custom weekdays</option>
                    </select>
                </div>
            )}

            {form.repeatMode === "custom" && (
                <div>
                    <label className={labelClass}>Weekdays</label>
                    <div className="flex gap-2 flex-wrap">
                        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => toggleWeekday(i)}
                                className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${form.weekdays.includes(i)
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                    }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {config.fields.showSingleDate && (
                <div className="col-span-1 md:col-span-2">
                    <label className={labelClass}>{config.labels.dateField}</label>
                    <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => updateForm("startDate", e.target.value)}
                        className={inputClass}
                    />
                </div>
            )}

            {config.fields.showDateRange && (
                <div className="col-span-1 md:col-span-2">
                    <label className={labelClass}>Date range</label>
                    <div className="flex gap-4">
                        <input
                            type="date"
                            value={form.startDate}
                            onChange={(e) => updateForm("startDate", e.target.value)}
                            className={inputClass}
                        />
                        <input
                            type="date"
                            value={form.endDate}
                            onChange={(e) => updateForm("endDate", e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
