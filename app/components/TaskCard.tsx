"use client";
import { TaskCardProps } from "@/types/task";
import { useTaskActions } from "@/hooks/useTaskActions";
import { useTimerSession } from "@/hooks/useTimerSession";
import { useTaskSubtasks } from "@/hooks/useTaskSubtasks";
import { TaskTimer } from "./tasks/TaskTimer";
import { SubtaskList } from "./tasks/SubtaskList";
import { AddSubtask } from "./tasks/AddSubtask";
import { ProgressBoxes } from "./tasks/ProgressBoxes";
import StatusBadge from "./tasks/StatusBadge";
import ProgressIndicator from "./tasks/ProgressIndicator";
import EditTaskModal from "./EditTaskModal";
import AddMissedTimeModal from "./AddMissedTimeModal";
import { memo, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isProfessionalCategory } from "@/lib/utils/filters";
import { get2AMDayKey, get2AMBoundaries } from "@/lib/utils/date";
import { trpc } from "@/utils/trpc";

function TaskCard({ task, refetch, currentMonth }: TaskCardProps) {
  const router = useRouter();

  // Use router.refresh() for server component revalidation if no refetch provided
  const handleRefresh = refetch || (() => router.refresh());

  // Actions - we pass currentMonth to enable proper optimistic updates
  const { deleteTask, updateStatus, updateProgress } = useTaskActions(
    handleRefresh,
    currentMonth ? { month: currentMonth.getMonth(), year: currentMonth.getFullYear() } : undefined
  );

  // Modal states
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMissedTimeModal, setShowMissedTimeModal] = useState(false);

  // Multi-select
  const toggleSelection = trpc.task.toggleTaskSelection.useMutation({
    onSuccess: handleRefresh,
  });

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    toggleSelection.mutate({
      taskId: task.id,
      isSelected: e.target.checked,
    });
  };

  // Timer session (for time-based and both habits)
  const { localSeconds, isRunning, start, stop } = useTimerSession({
    taskId: task.id,
    onRefresh: handleRefresh,
  });

  // Calculate today's time from timer sessions
  const completedSeconds = useMemo(() => {
    const { start: dayStart, end: dayEnd } = get2AMBoundaries(new Date());
    return (task.timerSessions || [])
      .filter((session: any) => {
        const sessionDate = new Date(session.date);
        return sessionDate >= dayStart && sessionDate < dayEnd && !session.isActive;
      })
      .reduce((sum: number, session: any) => sum + (session.seconds || 0), 0);
  }, [task.timerSessions]);

  const todayTimeSeconds = completedSeconds + (isRunning ? localSeconds : 0);

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

  // Local state for instant feedback on amount
  const [localAmount, setLocalAmount] = useState(completedSubtasks.length);

  // Sync local amount when source of truth changes (e.g. invalidation/refetch)
  useEffect(() => {
    setLocalAmount(completedSubtasks.length);
  }, [completedSubtasks.length]);

  const handleProgressChange = (level: number) => {
    updateProgress.mutate({
      taskId: task.id,
      date: get2AMDayKey(new Date()),
      progressLevel: level,
    });
  };

  // Get today's progress from statuses array (resets daily)
  const today = get2AMDayKey(new Date());
  const todayStatus = task.statuses?.find(
    (s: any) => get2AMDayKey(new Date(s.date)) === today
  );
  const todayProgress = todayStatus?.progressLevel ?? 0;

  const displayType = isProfessionalCategory(task.category) && task.type === 'task'
    ? 'habit'
    : task.type;

  const showTimer = task.type === "time" || task.habitType === "time" || task.habitType === "both";
  const showProgressBoxes = !showTimer && !task.habitType;

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 mb-2 border border-gray-100 hover:shadow-md transition-shadow relative">
      {/* Multi-select checkbox - top-left corner */}
      <div className="absolute top-2 left-2">
        <input
          type="checkbox"
          checked={task.isSelected || false}
          onChange={handleCheckboxChange}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          title="Select for batch delete"
        />
      </div>

      {/* Main row: Title, Type, Actions */}
      <div className="flex items-center justify-between gap-3 ml-6">
        {/* Left side: Title and badges */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-800 truncate">{task.title}</h3>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize shrink-0">
            {displayType}
          </span>
          {task.habitType && (
            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-600 capitalize shrink-0">
              {task.habitType === "both" ? "Time + Amount" : task.habitType}
            </span>
          )}
          {task.estimate && (
            <span className="text-xs text-gray-500 shrink-0">{task.estimate}m</span>
          )}
        </div>

        {/* Right side: Status Badge, Edit, View Analytics, Delete */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Auto-calculated status badge */}
          {task.habitType && (
            <StatusBadge
              task={task}
              timerSessions={task.timerSessions || []}
              todayCompletedSubtasks={localAmount}
            />
          )}

          {/* Edit button */}
          <button
            onClick={() => setShowEditModal(true)}
            className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Edit
          </button>

          {/* View Analytics button for habits only */}
          {(task.category === 'make_habit' || task.category === 'break_habit' || isProfessionalCategory(task.category)) && (
            <button
              onClick={() => {
                const categorySlug = (isProfessionalCategory(task.category) ? 'professional' : task.category).replace('_', '-');
                router.push(`/reports/${categorySlug}/${task.id}`);
              }}
              className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
            >
              Analytics
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
        <p className="text-xs text-gray-500 mt-1 ml-6">{task.notes}</p>
      )}

      {/* Progress indicator for habits */}
      {task.habitType && (
        <div className="mt-3 ml-6">
          <ProgressIndicator
            task={task}
            timerSessions={task.timerSessions || []}
            todayCompletedSubtasks={localAmount}
          />
        </div>
      )}

      {/* Progress boxes or Timer or Amount Counter */}
      <div className="mt-2 ml-6">
        {showProgressBoxes ? (
          <ProgressBoxes
            level={todayProgress}
            onChange={handleProgressChange}
            taskId={task.id}
          />
        ) : showTimer ? (
          <>
            <TaskTimer
              localSeconds={localSeconds}
              isRunning={isRunning}
              start={start}
              stop={stop}
            />
            <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
              <span>Today: {(todayTimeSeconds / 3600).toFixed(2)}h</span>
              {task.requiredMinutes && (
                <span className="text-gray-500">/ {(task.requiredMinutes / 60).toFixed(2)}h required</span>
              )}
              <button
                onClick={() => setShowMissedTimeModal(true)}
                className="px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 text-[11px]"
              >
                + Add time
              </button>
            </div>
            {/* Amount Counter for 'Both' type */}
            {(task.habitType === 'both' && (!task.subtasks || task.subtasks.length === 0)) && (
              <div className="mt-3 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-700">Amount:</span>
                  <button
                    onClick={() => {
                      const current = localAmount;
                      const newAmount = Math.max(0, current - 1);
                      setLocalAmount(newAmount);
                      const newCompleted = Array.from({ length: newAmount }, (_, i) => `unit_${i}`);
                      updateStatus.mutate({
                        taskId: task.id,
                        date: get2AMDayKey(new Date()),
                        completedSubtasks: newCompleted,
                        status: newAmount >= (task.requiredAmount || 0) ? 'SUCCESS' : newAmount > 0 ? 'HALF' : 'NONE'
                      });
                    }}
                    className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
                  >-</button>
                  <span className="text-sm font-semibold text-gray-800 w-12 text-center">
                    {localAmount} <span className="text-gray-400 font-normal">/ {task.requiredAmount || '?'}</span>
                  </span>
                  <button
                    onClick={() => {
                      const current = localAmount;
                      const newAmount = current + 1;
                      setLocalAmount(newAmount);
                      const newCompleted = Array.from({ length: newAmount }, (_, i) => `unit_${i}`);
                      updateStatus.mutate({
                        taskId: task.id,
                        date: get2AMDayKey(new Date()),
                        completedSubtasks: newCompleted,
                        status: newAmount >= (task.requiredAmount || 0) ? 'SUCCESS' : newAmount > 0 ? 'HALF' : 'NONE'
                      });
                    }}
                    className="w-6 h-6 flex items-center justify-center rounded bg-blue-500 hover:bg-blue-600 text-white"
                  >+</button>
                </div>
              </div>
            )}
          </>
        ) : (task.habitType === 'amount' && (!task.subtasks || task.subtasks.length === 0)) ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const current = localAmount;
                const newAmount = Math.max(0, current - 1);
                setLocalAmount(newAmount);
                const newCompleted = Array.from({ length: newAmount }, (_, i) => `unit_${i}`);
                updateStatus.mutate({
                  taskId: task.id,
                  date: get2AMDayKey(new Date()),
                  completedSubtasks: newCompleted,
                  status: newAmount >= (task.requiredAmount || 0) ? 'SUCCESS' : newAmount > 0 ? 'HALF' : 'NONE'
                });
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition-colors"
            >-</button>
            <div className="flex flex-col items-center min-w-[60px]">
              <span className="text-xl font-bold text-gray-800">{localAmount}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">of {task.requiredAmount || '-'}</span>
            </div>
            <button
              onClick={() => {
                const current = localAmount;
                const newAmount = current + 1;
                setLocalAmount(newAmount);
                const newCompleted = Array.from({ length: newAmount }, (_, i) => `unit_${i}`);
                updateStatus.mutate({
                  taskId: task.id,
                  date: get2AMDayKey(new Date()),
                  completedSubtasks: newCompleted,
                  status: newAmount >= (task.requiredAmount || 0) ? 'SUCCESS' : newAmount > 0 ? 'HALF' : 'NONE'
                });
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-sm"
            >+</button>
          </div>
        ) : null}
      </div>

      {/* Metadata row - compact inline */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 ml-6">
        <span>Priority: <span className="font-medium text-gray-700 capitalize">{task.priority || 'Medium'}</span></span>
        <span>Category: <span className="font-medium text-gray-700">{task.category || '-'}</span></span>
        {task.requiredAmount && (
          <span>Required: <span className="font-medium text-gray-700">{task.requiredAmount} units/day</span></span>
        )}
      </div>

      {/* Collapsible subtasks section */}
      {(task.subtasks?.length ?? 0) > 0 && (
        <div className="mt-2 ml-6">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <span>{isExpanded ? '▼' : '▶'}</span>
            Subtasks ({completedSubtasks.length}/{task.subtasks?.length || 0})
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

      {/* Modals */}
      <EditTaskModal
        task={task}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleRefresh}
      />

      <AddMissedTimeModal
        taskId={task.id}
        taskTitle={task.title}
        isOpen={showMissedTimeModal}
        onClose={() => setShowMissedTimeModal(false)}
        onSuccess={handleRefresh}
        date={get2AMDayKey(new Date())}
      />
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(TaskCard, (prevProps, nextProps) => {
  if (prevProps.task === nextProps.task && prevProps.currentMonth === nextProps.currentMonth) {
    return true;
  }

  if (prevProps.task.id !== nextProps.task.id) return false;
  if (prevProps.task.totalSeconds !== nextProps.task.totalSeconds) return false;
  if (prevProps.task.isSelected !== nextProps.task.isSelected) return false;

  const prevStatuses = prevProps.task.statuses || [];
  const nextStatuses = nextProps.task.statuses || [];
  if (prevStatuses.length !== nextStatuses.length) return false;

  const prevSubtasks = prevProps.task.subtasks || [];
  const nextSubtasks = nextProps.task.subtasks || [];
  if (prevSubtasks.length !== nextSubtasks.length) return false;

  const prevTimerSessions = prevProps.task.timerSessions || [];
  const nextTimerSessions = nextProps.task.timerSessions || [];
  if (prevTimerSessions.length !== nextTimerSessions.length) return false;

  return true;
});
