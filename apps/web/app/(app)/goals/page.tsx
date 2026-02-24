'use client';

import { useState } from 'react';
import { useGoalStore, useTaskStore } from '@mma/store';
import type { GoalType } from '@mma/types';

const TIMEFRAMES: { key: GoalType; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

export default function GoalsPage() {
  const { goals } = useGoalStore();
  const [activeTab, setActiveTab] = useState<GoalType>('weekly');

  const filtered = goals.filter((g) => g.timeframe === activeTab && !g._deleted);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Goals</h1>

      {/* Timeframe tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        {TIMEFRAMES.map(({ key, label }) => (
          <button
            key={key}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Goals list */}
      <div className="space-y-4">
        {filtered.map((goal) => {
          const pct = goal.targetCount > 0
            ? Math.round((goal.completedCount / goal.targetCount) * 100)
            : 0;

          return (
            <div key={goal.id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                <span className="text-sm text-gray-500">
                  {goal.completedCount} / {goal.targetCount}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    pct >= 100 ? 'bg-green-500' : pct >= 50 ? 'bg-blue-500' : 'bg-gray-400'
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 capitalize">{goal.status}</p>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-gray-400 text-center py-8">
            No {activeTab} goals yet.
          </p>
        )}
      </div>
    </div>
  );
}
