export default function TaskCardSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-sm p-3 mb-2 border border-gray-100 animate-fade-in">
            {/* Main row: Title, Type, Buttons */}
            <div className="flex items-center justify-between gap-3 mb-2">
                {/* Left side: Title and badges */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="h-5 w-32 bg-gray-200 rounded skeleton-shimmer"></div>
                    <div className="h-5 w-16 bg-gray-200 rounded skeleton-shimmer"></div>
                    <div className="h-4 w-8 bg-gray-200 rounded skeleton-shimmer"></div>
                </div>

                {/* Right side: Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    <div className="h-7 w-20 bg-gray-200 rounded skeleton-shimmer"></div>
                    <div className="h-7 w-16 bg-gray-200 rounded skeleton-shimmer"></div>
                </div>
            </div>

            {/* Progress boxes skeleton */}
            <div className="mt-2 flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-8 w-8 bg-gray-200 rounded skeleton-shimmer" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
            </div>

            {/* Metadata row */}
            <div className="flex items-center gap-4 mt-2">
                <div className="h-4 w-24 bg-gray-200 rounded skeleton-shimmer"></div>
                <div className="h-4 w-24 bg-gray-200 rounded skeleton-shimmer"></div>
            </div>

            {/* Subtasks skeleton (collapsed) */}
            <div className="mt-2">
                <div className="h-4 w-24 bg-gray-200 rounded skeleton-shimmer"></div>
            </div>
        </div>
    );
}

/**
 * FILE: app/components/TaskCardSkeleton.tsx
 * 
 * PURPOSE:
 * Loading skeleton component that mimics the layout of TaskCard.
 * Provides visual feedback during data fetching for better UX.
 * 
 * WHAT IT DOES:
 * - Renders placeholder boxes matching TaskCard layout
 * - Shows header, subtasks, habit grid, and footer sections
 * - Uses animate-pulse CSS class for pulsing animation
 * - Displays 10 day boxes in habit grid section
 * 
 * DEPENDENCIES (imports from):
 * - None (pure presentational component)
 * 
 * DEPENDENTS (files that import this):
 * - app/page.tsx: Uses in Suspense fallback
 * - app/loading.tsx: Shows 3 instances during page load
 * 
 * NOTES:
 * - Matches TaskCard structure for smooth transition
 * - Uses inline styles for simplicity
 * - Gray (#e5e7eb) background for skeleton elements
 * - animate-pulse class provides pulsing effect
 */
