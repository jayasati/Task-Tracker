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
import { memo } from "react";
import { useRouter } from "next/navigation";

function TaskCard({ task, refetch, currentMonth }: TaskCardProps) {
  const router = useRouter();

  // Use router.refresh() for server component revalidation if no refetch provided
  const handleRefresh = refetch || (() => router.refresh());

  // Actions
  const { deleteTask, updateSeconds, updateStatus } = useTaskActions(handleRefresh);

  // Timer
  const totalFromDB = task.totalSeconds ?? 0;
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
  } = useTaskSubtasks(task, updateStatus, handleRefresh);

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

      <HabitGrid task={task} refetch={handleRefresh} currentMonth={currentMonth} />

      <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
        <div>Priority: <span style={{ fontWeight: 600, color: '#1f2937', textTransform: 'capitalize' }}>{task.priority || 'Medium'}</span></div>
        <div>Category: <span style={{ fontWeight: 600, color: '#1f2937' }}>{task.category || '-'}</span></div>
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(TaskCard, (prevProps, nextProps) => {
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.totalSeconds === nextProps.task.totalSeconds &&
    JSON.stringify(prevProps.task.statuses) === JSON.stringify(nextProps.task.statuses) &&
    JSON.stringify(prevProps.task.subtasks) === JSON.stringify(nextProps.task.subtasks)
  );
});

/**
 * FILE: app/components/TaskCard.tsx
 * 
 * PURPOSE:
 * Main task display component showing all task information, timer, subtasks, and habit grid.
 * This is the most complex component in the application.
 * 
 * WHAT IT DOES:
 * - Displays task header with title, type, and delete button
 * - Shows timer controls for time-type tasks
 * - Renders subtask list with completion tracking
 * - Displays habit grid for daily status tracking
 * - Handles all task interactions (delete, timer, subtasks)
 * - Uses router.refresh() for server component revalidation
 * - Memoized with custom comparison function for performance
 * 
 * DEPENDENCIES (imports from):
 * - @/types/task: TaskCardProps type
 * - ./HabitGrid: Habit tracking grid component
 * - @/hooks/useTaskActions: Delete, updateSeconds, updateStatus mutations
 * - @/hooks/useTaskTimer: Timer start/stop logic
 * - @/hooks/useTaskSubtasks: Subtask management and rollover
 * - ./tasks/*: Sub-components (TaskHeader, TaskTimer, SubtaskList, AddSubtask)
 * - next/navigation: useRouter for revalidation
 * 
 * DEPENDENTS (files that import this):
 * - app/components/TasksListServerRSC.tsx: Renders TaskCard for each task
 * 
 * NOTES:
 * - Client component ("use client") - uses hooks and interactivity
 * - Memoization compares task.id, totalSeconds, statuses, and subtasks
 * - handleRefresh uses router.refresh() if no refetch prop provided
 * - Timer onStop callback creates TimeLog entry via updateSeconds
 * - Subtask logic includes rollover from previous days
 * - Delete requires confirmation dialog
 */
