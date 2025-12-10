"use client";

import { trpc } from "@/utils/trpc";
import { useState } from "react";

type AddTaskProps = {
  onAdded: () => void;
};

export default function AddTask({ onAdded }: AddTaskProps) {
  const [title, setTitle] = useState("");

  const addTask = trpc.task.addTask.useMutation({
    onSuccess: () => {
      setTitle("");
      onAdded();
    },
  });

  return (
    <div className="box add-task">
      <input
        className="input"
        placeholder="Enter task name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button
        className="btn btn-blue"
        onClick={() => {
          if (!title.trim()) return;
          addTask.mutate(title);
        }}
      >
        Add Task
      </button>
    </div>
  );
}
