import { HabitAnalyticsView } from '@/app/components/reports/HabitAnalyticsView';

interface PageProps {
    params: Promise<{
        habitId: string;
    }>;
}

export default async function ProfessionalAnalyticsPage({ params }: PageProps) {
    const { habitId } = await params;

    return (
        <HabitAnalyticsView
            habitId={habitId}
            category="professional"
            categoryTitle="Professional"
            categoryIcon="💼"
        />
    );
}
