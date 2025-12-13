"use client";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/utils/trpc";
import AddTask from "./components/AddTask";
import TaskCardSkeleton from "./components/TaskCardSkeleton";
import MainTabs from "./components/Navigation/MainTabs";
import SubTabs from "./components/Navigation/SubTabs";
import TaskListContainer from "./components/TaskList/TaskListContainer";
import { getTaskCounts } from "@/lib/utils/filters";

export default function Home() {
  const [currentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'today';

  const { data: tasks, isLoading, refetch } = trpc.task.getTasks.useQuery(
    {
      month: currentMonth.getMonth(),
      year: currentMonth.getFullYear(),
    },
    {
      staleTime: 1000, // 1 second - keep data fresh
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );

  const counts = useMemo(() => {
    if (!tasks) return { task: { active: 0, archived: 0, completed: 0, total: 0 } };
    return getTaskCounts(tasks);
  }, [tasks]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-50">
      {/* Main Navigation */}
      <MainTabs />

      {/* Sub Navigation */}
      <SubTabs activeTab={activeTab} counts={counts} />

      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-2 text-center">
          Task + Time Tracker
        </h1>
        <p className="text-gray-600 text-base text-center">Organize your tasks, build habits, track progress</p>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="max-w-5xl mx-auto px-4 space-y-6">
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </div>
      ) : (
        <TaskListContainer
          tasks={tasks || []}
          currentMonth={currentMonth}
          refetch={refetch}
        />
      )}

      {/* Add Task Form - Show at bottom, hide on Today and Reports tabs */}
      {activeTab !== 'reports' && activeTab !== 'today' && (
        <div className="max-w-5xl mx-auto px-4 pb-8 mt-4">
          <AddTask activeTab={activeTab} />
        </div>
      )}
    </div>
  );
}
