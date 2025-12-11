"use client";
import { TaskCardProps } from "@/types/task";
import HabitGrid from "./HabitGrid";
import { useTaskActions } from "@/hooks/useTaskActions";
import { useTaskTimer } from "@/hooks/useTaskTimer";
import { useTaskSubtasks } from "@/hooks/useTaskSubtasks";
import { TaskHeader } from "./tasks/TaskHeader";
import { TaskTimer } from "./tasks/TaskTimer";
import { SubtaskList } from "./tasks/SubtaskList";
import { AddSubtask } from "./tasks/AddSubtask";

export default function TaskCard({ task, refetch, currentMonth }: TaskCardProps) {
  // Actions
  const { deleteTask, updateSeconds, updateStatus } = useTaskActions(refetch);

  // Timer
  const totalFromDB = task.logs.reduce((s, l) => s + l.seconds, 0);
  const today = new Date().toISOString().split("T")[0];

  const { localSeconds, isRunning, start, stop } = useTaskTimer(totalFromDB, (gained) => {
    updateSeconds.mutate({
      taskId: task.id,
      seconds: gained,
      date: today,
    });
  });

  // Subtasks
  const {
    activeSubtasks,
    completedSubtasks,
    toggleSubtask,
    handleAddSubtask,
    isAddingSubtask,
    setIsAddingSubtask,
    newSubtaskName,
    setNewSubtaskName
  } = useTaskSubtasks(task, updateStatus, refetch);

  const handleDelete = () => {
    const confirmed = window.confirm("Delete this task? This cannot be undone.");
    if (!confirmed) return;
    deleteTask.mutate({ taskId: task.id });
  };

  return (
    <div className="box task">
      <TaskHeader
        task={task}
        onDelete={handleDelete}
        isDeleting={deleteTask.isPending}
        tick={isRunning}
      />

      {task.type === "time" && (
        <TaskTimer
          localSeconds={localSeconds}
          isRunning={isRunning}
          start={start}
          stop={stop}
        />
      )}

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <strong style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Subtasks</strong>
        </div>

        <SubtaskList
          activeSubtasks={activeSubtasks}
          completedSubtasks={completedSubtasks}
          toggleSubtask={toggleSubtask}
          hasSubtasksConfigured={(task.subtasks?.length ?? 0) > 0}
        />

        <AddSubtask
          isAdding={isAddingSubtask}
          setIsAdding={setIsAddingSubtask}
          value={newSubtaskName}
          onChange={setNewSubtaskName}
          onAdd={handleAddSubtask}
        />
      </div>

      <HabitGrid task={task} refetch={refetch} currentMonth={currentMonth} />

      <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
        <div>Priority: <span style={{ fontWeight: 600, color: '#1f2937', textTransform: 'capitalize' }}>{task.priority || 'Medium'}</span></div>
        <div>Category: <span style={{ fontWeight: 600, color: '#1f2937' }}>{task.category || '-'}</span></div>
      </div>
    </div>
  );
}
