"use client";

import AddTask from "./components/AddTask";
import TasksList from "./components/TasksListServer";

export default function Page() {
  return (
    <div className="container">
      <h2>Task + Time Tracker</h2>
      <AddTask />
      <TasksList />
    </div>
  );
}
