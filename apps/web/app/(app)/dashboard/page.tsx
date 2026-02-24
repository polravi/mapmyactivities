'use client';

import Link from 'next/link';
import { useTaskStore, useGoalStore, useAuthStore } from '@mma/store';
import { getActiveTasks } from '@mma/utils';
import { updateTask, deleteTask } from '@/lib/taskService';
import type { Task } from '@mma/types';

function TaskRow({ task, userId }: { task: Task; userId: string }) {
  async function toggleComplete() {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTask(userId, task.id, { status: newStatus });
  }

  async function handleDelete() {
    if (!confirm(`Delete "${task.title}"?`)) return;
    await deleteTask(userId, task.id);
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm flex items-center gap-3 group">
      <button
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
          task.status === 'done'
            ? 'bg-green-500 border-green-500'
            : 'border-gray-300 hover:border-green-400'
        }`}
        onClick={toggleComplete}
        aria-label={`Mark "${task.title}" as ${task.status === 'done' ? 'incomplete' : 'complete'}`}
      />

      <span
        className={`flex-1 text-sm ${
          task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'
        }`}
      >
        {task.title}
      </span>

      {task.dueDate && (
        <span className="text-xs text-gray-400 hidden sm:block">
          {new Date(task.dueDate).toLocaleDateString()}
        </span>
      )}

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

      {/* Edit / Delete — visible on hover */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          href={`/task/${task.id}/edit`}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
          aria-label="Edit task"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </Link>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
          aria-label="Delete task"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { tasks, isLoading } = useTaskStore();
  const { goals } = useGoalStore();
  const { user } = useAuthStore();

  const activeTasks = getActiveTasks(tasks);
  const completedToday = activeTasks.filter((t) => t.status === 'done').length;
  const activeGoals = goals.filter((g) => g.status === 'active' && !g._deleted);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/task/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New Task
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Tasks Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {completedToday}/{activeTasks.length}
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

      {/* Task list */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">All Tasks</h2>
      <div className="space-y-2">
        {activeTasks.map((task) => (
          <TaskRow key={task.id} task={task} userId={user?.id ?? ''} />
        ))}
        {activeTasks.length === 0 && (
          <div className="bg-white rounded-xl p-12 shadow-sm text-center">
            <p className="text-gray-400 mb-4">No tasks yet.</p>
            <Link
              href="/task/create"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Create your first task
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
