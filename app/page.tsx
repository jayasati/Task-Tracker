"use client";

import { trpc } from "@/utils/trpc";
import AddTask from "./components/AddTask";
import TaskCard from "./components/TaskCard";

export default function Page() {
  const { data: tasks, refetch } = trpc.task.getTasks.useQuery();

  return (
    <div className="container">
      <h2>Task + Time Tracker</h2>
      <AddTask onAdded={refetch} />

      {tasks?.map((task) => (
        <TaskCard key={task.id} task={task} refetch={refetch} />
      ))}
    </div>
  );
}
