import React from "react";
import { AddTaskFormState } from "@/hooks/useAddTaskForm";
import { getInputClass, getButtonClass } from "./styles";
import { getModeConfig } from "@/lib/config/modeConfig";

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
    const config = getModeConfig(form.mode || form.category);

    return (
        <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1 w-full">
                <input
                    required
                    placeholder={config.placeholders.title}
                    className={`${getInputClass(form.category)} text-lg py-4`}
                    value={form.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                    onFocus={() => setIsExpanded(true)}
                />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <button
                    type="submit"
                    disabled={isPending}
                    className={getButtonClass(form.category)}
                >
                    {isPending ? "Adding..." : config.buttonText}
                </button>
            </div>
        </div>
    );
}
