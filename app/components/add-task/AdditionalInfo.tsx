import React from "react";
import { AddTaskFormState } from "@/hooks/useAddTaskForm";
import { inputClass, labelClass } from "./styles";

interface AdditionalInfoProps {
    form: AddTaskFormState;
    updateForm: (field: string, value: any) => void;
    setIsExpanded: (expanded: boolean) => void;
}

export default function AdditionalInfo({
    form,
    updateForm,
    setIsExpanded,
}: AdditionalInfoProps) {
    return (
        <>
            <div>
                <label className={labelClass}>Subtasks</label>
                <input
                    placeholder="e.g. Read ch.1, Review notes"
                    className={inputClass}
                    value={form.subtasksStr}
                    onChange={(e) => updateForm("subtasksStr", e.target.value)}
                />
            </div>

            <div>
                <label className={labelClass}>Notes</label>
                <textarea
                    rows={2}
                    placeholder="Add any extra details here..."
                    className={`${inputClass} resize-none`}
                    value={form.notes}
                    onChange={(e) => updateForm("notes", e.target.value)}
                />
            </div>

            <div className="flex justify-end pt-2">
                <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="text-sm font-semibold text-gray-400 hover:text-gray-600 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                    Cancel / Collapse
                </button>
            </div>
        </>
    );
}
