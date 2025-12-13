'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SubView, MainTab } from '@/lib/utils/filters';

interface SubTabsProps {
    activeTab: string;
    counts: Record<string, { active: number; archived: number; completed: number; total: number }>;
}

export default function SubTabs({ activeTab, counts }: SubTabsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeView = (searchParams.get('view') as SubView) || 'active';

    // Don't show sub-tabs for Today view
    if (activeTab === 'today') return null;

    // Get counts for the current tab
    const currentCounts = counts[activeTab] || { active: 0, archived: 0, completed: 0, total: 0 };

    const views: { id: SubView; label: string }[] = [
        { id: 'active', label: 'Active' },
        { id: 'archived', label: 'Archived' },
        { id: 'completed', label: 'Completed' },
    ];

    const handleViewClick = (viewId: SubView) => {
        router.push(`/?tab=${activeTab}&view=${viewId}`);
    };

    return (
        <div className="bg-gray-50/50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-3">
                <div className="flex gap-3">
                    {views.map((view) => (
                        <button
                            key={view.id}
                            onClick={() => handleViewClick(view.id)}
                            className={`
                px-4 py-2 rounded-lg font-medium text-sm
                transition-all duration-200
                ${activeView === view.id
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                }
              `}
                        >
                            {view.label} ({currentCounts[view.id]})
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
