'use client';

import { useTaskStore, useGoalStore } from '@mma/store';
import { getActiveTasks } from '@mma/utils';

export default function DashboardPage() {
  const { tasks, setTaskStatus } = useTaskStore();
  const { goals } = useGoalStore();

  const activeTasks = getActiveTasks(tasks);
  const completedToday = activeTasks.filter((t) => t.status === 'done').length;
  const totalTasks = activeTasks.length;
  const activeGoals = goals.filter((g) => g.status === 'active' && !g._deleted);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Tasks Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {completedToday}/{totalTasks}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Active Goals</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{activeGoals.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Unassigned Tasks</p>
          <p className="text-3xl font-bold text-gray-600 mt-1">
            {activeTasks.filter((t) => !t.eisenhowerQuadrant).length}
          </p>
        </div>
      </div>

      {/* Today's tasks */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Tasks</h2>
      <div className="space-y-2">
        {activeTasks.slice(0, 10).map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-lg p-4 shadow-sm flex items-center gap-3"
          >
            <button
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                task.status === 'done'
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() =>
                setTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')
              }
              aria-label={`Mark "${task.title}" as ${task.status === 'done' ? 'incomplete' : 'complete'}`}
            />
            <span
              className={`flex-1 ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}
            >
              {task.title}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                task.priority === 'high'
                  ? 'bg-red-100 text-red-700'
                  : task.priority === 'medium'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              {task.priority}
            </span>
          </div>
        ))}
        {activeTasks.length === 0 && (
          <p className="text-gray-400 text-center py-8">
            No tasks yet. Create your first task to get started.
          </p>
        )}
      </div>
    </div>
  );
}
