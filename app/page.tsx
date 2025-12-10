"use client";

import { trpc } from "@/utils/trpc";

export default function Page() {
  const tasksQuery = trpc.task.getTasks.useQuery();
  const addTask = trpc.task.addTask.useMutation();

  const onAdd = () => addTask.mutate("New Task", { onSuccess: () => tasksQuery.refetch() });

  return (
    <div>
      <h2>Task Tracker</h2>
      <button onClick={onAdd}>Add Task</button>

      {tasksQuery.data?.map(task => (
        <div key={task.id}>
          {task.title} — {task.logs.reduce((s,l)=>s+l.seconds,0)}s
        </div>
      ))}
    </div>
  );
}
