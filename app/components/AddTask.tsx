"use client";

import { trpc } from "@/utils/trpc";
import { useState } from "react";

export default function AddTask() {
  const [title, setTitle] = useState("");
  const utils = trpc.useUtils();

  const addTask = trpc.task.addTask.useMutation({
    onSuccess: () => {
      setTitle("");
      utils.task.getTasks.invalidate();
    },
  });

  return (
    <div className="box add-task" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
      <input
        className="input"
        placeholder="Enter task name..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && title.trim()) {
            addTask.mutate(title);
          }
        }}
        style={{ flex: '1', minWidth: '200px' }}
      />

      <button
        className="btn btn-blue"
        onClick={() => {
          if (!title.trim()) return;
          addTask.mutate(title);
        }}
        disabled={addTask.isPending || !title.trim()}
        style={{ opacity: (!title.trim() || addTask.isPending) ? 0.6 : 1 }}
      >
        {addTask.isPending ? 'Adding...' : 'Add Task'}
      </button>
    </div>
  );
}
