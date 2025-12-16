/**
 * Habit Analytics Time Tracking Component
 */
import React from 'react';

interface TimeStat {
  label: string;
  period: number;
  icon: string;
  color: string;
  bg: string;
}

interface HabitAnalyticsTimeTrackingProps {
  habit: any;
  chartDays: { date: string; seconds: number }[];
}

export function HabitAnalyticsTimeTracking({ habit, chartDays }: HabitAnalyticsTimeTrackingProps) {
  const timeStats: TimeStat[] = [
    {
      label: 'This Week',
      period: 7,
      icon: '📅',
      color: 'text-indigo-600',
      bg: 'from-indigo-50 to-white'
    },
    {
      label: 'This Month',
      period: 30,
      icon: '📆',
      color: 'text-violet-600',
      bg: 'from-violet-50 to-white'
    },
    {
      label: 'This Year',
      period: 365,
      icon: '🗓️',
      color: 'text-purple-600',
      bg: 'from-purple-50 to-white'
    }
  ];

  return (
    <>
      {/* Time Overview Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Time Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {timeStats.map((stat) => {
            const now = new Date();
            const cutoff = new Date(now);
            cutoff.setDate(now.getDate() - stat.period);

            const totalSeconds = (habit.timerSessions || []).reduce((acc: number, sess: any) => {
              if (new Date(sess.date) >= cutoff) {
                return acc + sess.seconds;
              }
              return acc;
            }, 0);

            return (
              <div key={stat.label} className={`bg-gradient-to-br ${stat.bg} rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className="text-sm text-gray-600 font-medium uppercase tracking-wide">{stat.label}</span>
                </div>
                <div className={`text-3xl font-extrabold ${stat.color}`}>
                  {(totalSeconds / 3600).toFixed(1)}h
                </div>
                <div className="text-xs text-gray-400 mt-1 font-medium">Last {stat.period} days</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex justify-between items-center">
          <span>Time invested (past 14 days)</span>
          <span className="text-2xl font-bold text-blue-600">
            {chartDays.reduce((acc, day) => acc + (day.seconds / 3600), 0).toFixed(1)}h
          </span>
        </h3>
        <div className="flex items-end h-40 gap-1 pt-6">
          {chartDays.map((day) => {
            const hours = day.seconds / 3600;
            // Scale based on max value (min 4 hours scale)
            const maxHours = Math.max(Math.max(...chartDays.map(d => d.seconds / 3600)), 4);
            const percentage = (hours / maxHours) * 100;

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                  {hours.toFixed(2)}h
                </div>

                <div
                  className={`w-full max-w-[16px] rounded-t-sm transition-all duration-500 ${hours > 0 ? 'bg-blue-500' : 'bg-gray-100'
                    }`}
                  style={{ height: `${percentage}%` }}
                />
                <span className="text-[10px] text-gray-500 mt-2">
                  {new Date(day.date).getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
