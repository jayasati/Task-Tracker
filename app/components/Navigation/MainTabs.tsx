'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Category, MainTab } from '@/lib/utils/filters';

interface TabConfig {
    id: MainTab;
    label: string;
    icon: string;
}

const tabs: TabConfig[] = [
    { id: 'today', label: 'Today', icon: '🌟' },
    { id: 'task', label: 'Task', icon: '📋' },
    { id: 'make_habit', label: 'Make Habit', icon: '✅' },
    { id: 'break_habit', label: 'Break Habit', icon: '🚫' },
    { id: 'professional', label: 'Professional', icon: '💼' },
    { id: 'reports', label: 'Reports', icon: '📊' },
];

export default function MainTabs() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = (searchParams.get('tab') as MainTab) || 'today';

    const handleTabClick = (tabId: MainTab) => {
        // For today tab, no sub-view needed
        if (tabId === 'today') {
            router.push(`/?tab=${tabId}`);
        } else {
            router.push(`/?tab=${tabId}&view=active`);
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto">
                <div className="flex gap-3 overflow-x-auto px-6 py-4 scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`
                flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm
                transition-all duration-200 whitespace-nowrap
                ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                                }
              `}
                        >
                            <span className="text-base">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
