import { HabitAnalyticsView } from '@/app/components/reports/HabitAnalyticsView';

interface PageProps {
    params: Promise<{
        habitId: string;
    }>;
}

export default async function MakeHabitAnalyticsPage({ params }: PageProps) {
    const { habitId } = await params;

    return (
        <HabitAnalyticsView
            habitId={habitId}
            category="make_habit"
            categoryTitle="Make Habit"
            categoryIcon="🟢"
        />
    );
}
