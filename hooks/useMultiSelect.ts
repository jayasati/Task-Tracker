import { useState } from "react";
import { trpc } from "@/utils/trpc";

export function useMultiSelect(onRefresh: () => void) {
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

    const toggleSelection = trpc.task.toggleTaskSelection.useMutation({
        onSuccess: () => {
            onRefresh();
        },
    });

    const handleToggle = (taskId: string, currentlySelected: boolean) => {
        const newSelected = new Set(selectedTaskIds);
        if (currentlySelected) {
            newSelected.delete(taskId);
        } else {
            newSelected.add(taskId);
        }
        setSelectedTaskIds(newSelected);

        toggleSelection.mutate({
            taskId,
            isSelected: !currentlySelected,
        });
    };

    const clearSelection = () => {
        setSelectedTaskIds(new Set());
    };

    return {
        selectedTaskIds,
        handleToggle,
        clearSelection,
        isSelected: (taskId: string) => selectedTaskIds.has(taskId),
    };
}

/**
 * FILE: hooks/useMultiSelect.ts
 * 
 * PURPOSE:
 * Hook for managing multi-select state for tasks
 * 
 * FEATURES:
 * - Toggle individual task selection
 * - Track selected task IDs
 * - Clear all selections
 * - Check if task is selected
 */
