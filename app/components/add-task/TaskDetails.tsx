import React from "react";
import { AddTaskFormState } from "@/hooks/useAddTaskForm";
import { getInputClass, labelClass } from "./styles";
import { getModeConfig } from "@/lib/config/modeConfig";

interface TaskDetailsProps {
    form: AddTaskFormState;
    updateForm: (field: string, value: any) => void;
}

export default function TaskDetails({ form, updateForm }: TaskDetailsProps) {
    const config = getModeConfig(form.category);
    const inputClass = getInputClass(form.category);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {config.fields.showPriority && (
                <div>
                    <label className={labelClass}>Priority</label>
                    <select
                        value={form.priority}
                        onChange={(e) => updateForm("priority", e.target.value)}
                        className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-8 cursor-pointer text-center`}
                        style={{ textAlignLast: "center" }}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            )}

            {config.fields.showCategory && (
                <div>
                    <label className={labelClass}>Category</label>
                    <select
                        value={form.category}
                        onChange={(e) => updateForm("category", e.target.value)}
                        className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-8 cursor-pointer text-center`}
                        style={{ textAlignLast: "center" }}
                    >
                        <option value="meeting">Meeting</option>
                        <option value="coding">Coding</option>
                        <option value="study">Study</option>
                        <option value="sales">Sales</option>
                    </select>
                </div>
            )}

            {config.fields.showAmount && (
                <div>
                    <label className={labelClass}>{config.labels.amount || "Amount"}</label>
                    <input
                        placeholder={config.placeholders.amount}
                        className={inputClass}
                        value={form.amount}
                        onChange={(e) => updateForm("amount", e.target.value)}
                    />
                </div>
            )}

            {config.fields.showEstimate && (
                <div>
                    <label className={labelClass}>{config.labels.estimate || "Min"}</label>
                    <input
                        type="number"
                        min="0"
                        placeholder={config.placeholders.estimate || "0"}
                        className={inputClass}
                        value={form.estimate}
                        onChange={(e) => updateForm("estimate", e.target.value)}
                    />
                </div>
            )}
        </div>
    );
}
