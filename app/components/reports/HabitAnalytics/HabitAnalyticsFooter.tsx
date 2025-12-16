/**
 * Habit Analytics Footer Component
 */
import React from 'react';
import Link from 'next/link';
import { Task } from '@/types/task';

interface HabitAnalyticsFooterProps {
  habit: Task;
  categoryTitle: string;
  categorySlug: string;
}

export function HabitAnalyticsFooter({ habit, categoryTitle, categorySlug }: HabitAnalyticsFooterProps) {
  return (
    <>
      {/* Additional Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">About This Habit</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Created: {new Date(habit.createdAt!).toLocaleDateString()}</li>
              {habit.startDate && (
                <li>• Start Date: {new Date(habit.startDate).toLocaleDateString()}</li>
              )}
              {habit.endDate && (
                <li>• End Date: {new Date(habit.endDate).toLocaleDateString()}</li>
              )}
              <li>• Priority: <span className="capitalize">{habit.priority || 'Medium'}</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-8">
        <Link
          href={`/reports/${categorySlug}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:shadow-md transition-all text-gray-700 font-medium"
        >
          <span>←</span>
          <span>Back to {categoryTitle}</span>
        </Link>
      </div>
    </>
  );
}
