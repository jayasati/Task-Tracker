

export default function TaskCardSkeleton() {
    return (
        <div className="box task animate-pulse">
            {/* Header skeleton */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ height: '28px', width: '60%', backgroundColor: '#e5e7eb', borderRadius: '4px', marginBottom: '8px' }}></div>
                    <div style={{ height: '16px', width: '40%', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
                </div>
                <div style={{ height: '32px', width: '32px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
            </div>

            {/* Subtasks skeleton */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{ height: '14px', width: '80px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginBottom: '8px' }}></div>
                <div style={{ height: '20px', width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
            </div>

            {/* Habit grid skeleton */}
            <div style={{ marginTop: '16px' }}>
                <div style={{ height: '16px', width: '200px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginBottom: '12px' }}></div>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'hidden' }}>
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} style={{ minWidth: '44px', height: '44px', backgroundColor: '#e5e7eb', borderRadius: '10px' }}></div>
                    ))}
                </div>
            </div>

            {/* Footer skeleton */}
            <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
                <div style={{ height: '16px', width: '100px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
                <div style={{ height: '16px', width: '100px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
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
