import { HabitAnalyticsView } from '@/app/components/reports/HabitAnalyticsView';

interface PageProps {
    params: Promise<{
        habitId: string;
    }>;
}

export default async function BreakHabitAnalyticsPage({ params }: PageProps) {
    const { habitId } = await params;

    return (
        <HabitAnalyticsView
            habitId={habitId}
            category="break_habit"
            categoryTitle="Break Habit"
            categoryIcon="🔴"
        />
    );
}
