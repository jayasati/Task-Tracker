import { trpc } from "@/utils/trpc";

export function useTaskActions(refetch: () => void) {
    const utils = trpc.useUtils();

    const updateSeconds = trpc.task.updateSeconds.useMutation({
        onSuccess: refetch,
    });

    const deleteTask = trpc.task.deleteTask.useMutation({
        // Optimistic remove; rollback on error
        onMutate: async ({ taskId }) => {
            await utils.task.getTasks.cancel();
            const prev = utils.task.getTasks.getData();
            if (prev) {
                utils.task.getTasks.setData(undefined, prev.filter((t) => t.id !== taskId));
            }
            return { prev };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.prev) utils.task.getTasks.setData(undefined, ctx.prev);
        },
        onSuccess: () => {
            // Keep cache in sync; background refetch
            utils.task.getTasks.invalidate();
            refetch();
        },
    });

    const updateStatus = trpc.task.updateStatus.useMutation({
        onSuccess: refetch, // or optimistically update if feeling brave
    });

    return { updateSeconds, deleteTask, updateStatus };
}
