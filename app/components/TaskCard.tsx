"use client";
import { TaskCardProps } from "@/types/task";
import { useTaskActions } from "@/hooks/useTaskActions";
import { useTaskTimer } from "@/hooks/useTaskTimer";
import { useTaskSubtasks } from "@/hooks/useTaskSubtasks";
import { TaskHeader } from "./tasks/TaskHeader";
import { TaskTimer } from "./tasks/TaskTimer";
import { SubtaskList } from "./tasks/SubtaskList";
import { AddSubtask } from "./tasks/AddSubtask";
import { ProgressBoxes } from "./tasks/ProgressBoxes";
import { memo, useState } from "react";
import { useRouter } from "next/navigation";

function TaskCard({ task, refetch, currentMonth }: TaskCardProps) {
  const router = useRouter();

  // Use router.refresh() for server component revalidation if no refetch provided
  const handleRefresh = refetch || (() => router.refresh());

  // Actions
  const { deleteTask, updateSeconds, updateStatus, updateProgress } = useTaskActions(handleRefresh);

  // Collapsible state for subtasks
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleProgressChange = (level: number) => {
    updateProgress.mutate({
      taskId: task.id,
      date: today,
      progressLevel: level,
    });
  };

  // Get today's progress from statuses array (resets daily)
  const todayStatus = task.statuses?.find(
    s => new Date(s.date).toISOString().split('T')[0] === today
  );
  const todayProgress = todayStatus?.progressLevel ?? 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 mb-2 border border-gray-100 hover:shadow-md transition-shadow">
      {/* Main row: Title, Type, Progress/Timer, Delete */}
      <div className="flex items-center justify-between gap-3">
        {/* Left side: Title and badges */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-800 truncate">{task.title}</h3>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize shrink-0">
            {task.type}
          </span>
          {task.estimate && (
            <span className="text-xs text-gray-500 shrink-0">{task.estimate}m</span>
          )}
        </div>

        {/* Right side: View Analytics and Delete buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* View Analytics button for habits only */}
          {(task.category === 'make_habit' || task.category === 'break_habit' || task.category === 'professional') && (
            <button
              onClick={() => {
                const categorySlug = task.category.replace('_', '-');
                router.push(`/reports/${categorySlug}/${task.id}`);
              }}
              className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
            >
              View Analytics
            </button>
          )}

          <button
            onClick={handleDelete}
            className="px-3 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
            disabled={deleteTask.isPending}
          >
            {deleteTask.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>

        {/* Timer indicator */}
        {isRunning && (
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
        )}
      </div>

      {/* Notes (if any) */}
      {task.notes && (
        <p className="text-xs text-gray-500 mt-1 ml-0">{task.notes}</p>
      )}

      {/* Progress boxes or Timer - starts from left */}
      <div className="mt-2">
        {task.type !== "time" ? (
          <ProgressBoxes
            level={todayProgress}
            onChange={handleProgressChange}
            taskId={task.id}
          />
        ) : (
          <TaskTimer
            localSeconds={localSeconds}
            isRunning={isRunning}
            start={start}
            stop={stop}
          />
        )}
      </div>

      {/* Metadata row - compact inline */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
        <span>Priority: <span className="font-medium text-gray-700 capitalize">{task.priority || 'Medium'}</span></span>
        <span>Category: <span className="font-medium text-gray-700">{task.category || '-'}</span></span>
      </div>

      {/* Collapsible subtasks section */}
      {(task.subtasks?.length ?? 0) > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <span>{isExpanded ? '▼' : '▶'}</span>
            Subtasks ({task.subtasks?.length || 0})
          </button>

          {isExpanded && (
            <div className="mt-2 pl-3 border-l-2 border-gray-200">
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
          )}
        </div>
      )}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
// Optimized comparison function - avoids expensive JSON.stringify
export default memo(TaskCard, (prevProps, nextProps) => {
  // Quick reference equality check first
  if (prevProps.task === nextProps.task && prevProps.currentMonth === nextProps.currentMonth) {
    return true;
  }

  // Compare individual fields
  if (prevProps.task.id !== nextProps.task.id) return false;
  if (prevProps.task.totalSeconds !== nextProps.task.totalSeconds) return false;
  if (prevProps.task.progressLevel !== nextProps.task.progressLevel) return false;
  
  // Compare statuses array length and key fields
  const prevStatuses = prevProps.task.statuses || [];
  const nextStatuses = nextProps.task.statuses || [];
  if (prevStatuses.length !== nextStatuses.length) return false;
  
  // Compare subtasks array
  const prevSubtasks = prevProps.task.subtasks || [];
  const nextSubtasks = nextProps.task.subtasks || [];
  if (prevSubtasks.length !== nextSubtasks.length) return false;
  if (prevSubtasks.join(',') !== nextSubtasks.join(',')) return false;

  // For statuses, compare only the relevant fields we care about
  // Only check today's status which is what we use in the component
  const today = new Date().toISOString().split('T')[0];
  const prevTodayStatus = prevStatuses.find(s => new Date(s.date).toISOString().split('T')[0] === today);
  const nextTodayStatus = nextStatuses.find(s => new Date(s.date).toISOString().split('T')[0] === today);
  
  if (prevTodayStatus?.progressLevel !== nextTodayStatus?.progressLevel) return false;
  if (prevTodayStatus?.status !== nextTodayStatus?.status) return false;
  
  return true;
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
