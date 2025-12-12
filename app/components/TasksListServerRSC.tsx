import { getCurrentMonthTasks } from "@/server/queries/tasks";
import TaskCard from "./TaskCard";

// Force dynamic rendering for this component
export const dynamic = 'force-dynamic';

/**
 * Server Component that fetches and renders tasks
 * This enables server-side rendering and streaming
 */
export default async function TasksListServerRSC() {
    const tasks = await getCurrentMonthTasks();

    // Get current month on server
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (!tasks || tasks.length === 0) {
        return (
            <div className="box" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: '#64748b', fontSize: '18px' }}>No tasks yet. Add one above to get started!</p>
            </div>
        );
    }

    return (
        <>
            {tasks.map((task) => (
                <TaskCard
                    key={task.id}
                    task={task}
                    currentMonth={currentMonth}
                />
            ))}
        </>
    );
}

/**
 * FILE: app/components/TasksListServerRSC.tsx
 * 
 * PURPOSE:
 * Server component that fetches tasks from the database and renders them.
 * Enables server-side rendering and streaming for better performance.
 * 
 * WHAT IT DOES:
 * - Fetches current month's tasks from database on the server
 * - Renders TaskCard components for each task
 * - Shows empty state message if no tasks exist
 * - Passes currentMonth date to each TaskCard
 * - Forces dynamic rendering to ensure fresh data
 * 
 * DEPENDENCIES (imports from):
 * - @/server/queries/tasks: getCurrentMonthTasks function for data fetching
 * - ./TaskCard: Client component that displays individual task
 * 
 * DEPENDENTS (files that import this):
 * - app/page.tsx: Renders this component inside Suspense boundary
 * 
 * RELATED FILES:
 * - server/queries/tasks.ts: Provides data fetching function
 * - app/components/TaskCard.tsx: Renders individual tasks
 * 
 * NOTES:
 * - This is an async server component (can use await)
 * - No "use client" directive = server component
 * - export const dynamic = 'force-dynamic' prevents static generation
 * - Data is fetched fresh on every request (no caching)
 * - Wrapped in Suspense in page.tsx for streaming
 */
