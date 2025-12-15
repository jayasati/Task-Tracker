import React from "react";
import { AddTaskFormState } from "@/hooks/useAddTaskForm";
import { getInputClass, labelClass } from "./styles";
import { getModeConfig } from "@/lib/config/modeConfig";

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
    const mode = form.mode || form.category;
    const config = getModeConfig(mode);
    const inputClass = getInputClass(mode);

    return (
        <>
            {config.fields.showSubtasks && (
                <div>
                    <label className={labelClass}>Subtasks</label>
                    <input
                        placeholder={config.placeholders.subtasks || "e.g. Read ch.1, Review notes"}
                        className={inputClass}
                        value={form.subtasksStr}
                        onChange={(e) => updateForm("subtasksStr", e.target.value)}
                    />
                </div>
            )}

            {config.fields.showNotes && (
                <div>
                    <label className={labelClass}>Notes</label>
                    <textarea
                        rows={2}
                        placeholder={config.placeholders.notes || "Add any extra details here..."}
                        className={`${inputClass} resize-none`}
                        value={form.notes}
                        onChange={(e) => updateForm("notes", e.target.value)}
                    />
                </div>
            )}

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
