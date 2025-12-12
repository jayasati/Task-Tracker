import { Suspense } from "react";
import AddTask from "./components/AddTask";
import TasksListServerRSC from "./components/TasksListServerRSC";
import TaskCardSkeleton from "./components/TaskCardSkeleton";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h2>Task + Time Tracker</h2>
      <AddTask />
      <Suspense fallback={
        <>
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </>
      }>
        <TasksListServerRSC />
      </Suspense>
    </div>
  );
}

/**
 * FILE: app/page.tsx
 * 
 * PURPOSE:
 * Main page component for the task tracker application. Serves as the root route ("/")
 * and orchestrates the layout of the task management interface with server-side rendering
 * and streaming capabilities.
 * 
 * WHAT IT DOES:
 * - Renders the main application layout with header
 * - Displays the AddTask form for creating new tasks
 * - Shows the task list with Suspense boundary for streaming
 * - Provides skeleton loading states while tasks are being fetched
 * - Forces dynamic rendering to ensure fresh data on every request
 * 
 * DEPENDENCIES (imports from):
 * - react: Suspense for streaming UI
 * - ./components/AddTask: Task creation form component
 * - ./components/TasksListServerRSC: Server component that fetches and displays tasks
 * - ./components/TaskCardSkeleton: Loading skeleton for task cards
 * 
 * DEPENDENTS (files that import this):
 * - None (this is a Next.js page route, automatically used by the framework)
 * 
 * RELATED FILES:
 * - app/layout.tsx: Parent layout that wraps this page
 * - app/loading.tsx: Root loading UI (fallback for this page)
 * 
 * NOTES:
 * - Uses Next.js 16 App Router with server components
 * - `export const dynamic = 'force-dynamic'` ensures no static generation
 * - Suspense boundary enables progressive rendering of task list
 * - Three skeleton cards shown during initial load for better UX
 */
