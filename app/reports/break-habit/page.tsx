import { getCurrentMonthTasks } from '@/server/queries/tasks';
import Link from 'next/link';
import { CategoryHabitList } from '@/app/components/reports/CategoryHabitList';
import { auth } from '@clerk/nextjs/server';

export default async function BreakHabitReportsPage() {
    const { userId } = await auth();
    if (!userId) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-red-50 to-rose-50 flex items-center justify-center">
                <p className="text-gray-600 text-lg">Please sign in to view your reports.</p>
            </div>
        );
    }
    const tasks = await getCurrentMonthTasks(userId);

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-rose-50">
            {/* Breadcrumb Navigation */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/?tab=reports" className="text-blue-600 hover:text-blue-800 font-medium">
                            📊 Reports
                        </Link>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-800 font-semibold">🔴 Break Habit</span>
                    </div>
                </div>
            </div>

            {/* Page Header */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-3">
                        <span className="text-6xl">🔴</span>
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-800">
                                Break Habit Analytics
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Monitor your progress in breaking negative habits
                            </p>
                        </div>
                    </div>
                </div>

                {/* Habit List */}
                <CategoryHabitList
                    tasks={tasks}
                    category="break_habit"
                    categoryTitle="Break Habit"
                    categoryIcon="🔴"
                />
            </div>
        </div>
    );
}
