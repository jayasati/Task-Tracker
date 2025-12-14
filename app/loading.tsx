import TaskCardSkeleton from "./components/TaskCardSkeleton";
import MainTabs from "./components/Navigation/MainTabs";

export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-50 animate-fade-in">
            {/* Main Navigation */}
            <MainTabs />

            {/* Sub Navigation Skeleton */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="flex gap-3 overflow-x-auto px-6 py-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div 
                                key={i} 
                                className="h-8 w-20 bg-gray-200 rounded-full skeleton-shimmer"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="max-w-5xl mx-auto px-4 py-6 animate-fade-in">
                <div className="h-10 w-64 bg-gray-200 rounded mx-auto mb-2 skeleton-shimmer"></div>
                <div className="h-5 w-96 bg-gray-200 rounded mx-auto skeleton-shimmer mt-2"></div>
            </div>

            {/* Task List Skeleton */}
            <div className="max-w-5xl mx-auto px-4 space-y-6 py-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ animationDelay: `${i * 0.15}s` }} className="animate-fade-in">
                        <TaskCardSkeleton />
                    </div>
                ))}
            </div>
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
