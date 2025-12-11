"use client";

import AddTask from "./components/AddTask";
import TasksList from "./components/TasksListServer";

export default function Page() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h2>Task + Time Tracker</h2>
      <AddTask />
      <TasksList />
    </div>
  );
}
