import { getCurrentMonthTasks } from '@/server/queries/tasks';
import Link from 'next/link';
import { CategoryHabitList } from '@/app/components/reports/CategoryHabitList';

export default async function ProfessionalReportsPage() {
    const tasks = await getCurrentMonthTasks();

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
            {/* Breadcrumb Navigation */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/?tab=reports" className="text-blue-600 hover:text-blue-800 font-medium">
                            📊 Reports
                        </Link>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-800 font-semibold">💼 Professional</span>
                    </div>
                </div>
            </div>

            {/* Page Header */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-3">
                        <span className="text-6xl">💼</span>
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-800">
                                Professional Habit Analytics
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Analyze your professional development and productivity
                            </p>
                        </div>
                    </div>
                </div>

                {/* Habit List */}
                <CategoryHabitList
                    tasks={tasks}
                    category="professional"
                    categoryTitle="Professional"
                    categoryIcon="💼"
                />
            </div>
        </div>
    );
}
