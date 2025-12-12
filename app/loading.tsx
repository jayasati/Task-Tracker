import TaskCardSkeleton from "./components/TaskCardSkeleton";

export default function Loading() {
    return (
        <div className="max-w-5xl mx-auto py-12 px-4">
            <h2>Task + Time Tracker</h2>

            {/* AddTask skeleton */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 border border-gray-100/50 animate-pulse">
                <div style={{ height: '48px', width: '100%', backgroundColor: '#e5e7eb', borderRadius: '8px' }}></div>
            </div>

            {/* Task cards skeleton */}
            <TaskCardSkeleton />
            <TaskCardSkeleton />
            <TaskCardSkeleton />
        </div>
    );
}

/**
 * FILE: app/loading.tsx
 * 
 * PURPOSE:
 * Root loading UI component displayed during page transitions and initial page loads.
 * Provides skeleton screens for better perceived performance.
 * 
 * WHAT IT DOES:
 * - Shows loading state while page.tsx is being rendered
 * - Displays skeleton for AddTask form
 * - Shows 3 TaskCardSkeleton components
 * - Uses animate-pulse for visual feedback
 * 
 * DEPENDENCIES (imports from):
 * - ./components/TaskCardSkeleton: Skeleton component for task cards
 * 
 * DEPENDENTS (files that use this):
 * - Next.js framework (automatically shown during loading)
 * 
 * NOTES:
 * - This is a special Next.js file that shows during Suspense fallbacks
 * - Matches the layout of app/page.tsx for smooth transitions
 */
