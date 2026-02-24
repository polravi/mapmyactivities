'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTaskStore, useAuthStore } from '@mma/store';
import { CreateTaskInputSchema } from '@mma/types';
import type { TaskPriority, GoalType } from '@mma/types';
import { QUADRANT_INFO } from '@mma/types';

export default function CreateTaskPage() {
  const router = useRouter();
  const { addTask } = useTaskStore();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [quadrant, setQuadrant] = useState<number | null>(null);
  const [goalType, setGoalType] = useState<GoalType | null>(null);
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const result = CreateTaskInputSchema.safeParse({
      title,
      description: description || undefined,
      priority,
      eisenhowerQuadrant: quadrant,
      goalType,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    addTask(result.data, user?.id ?? '');
    router.back();
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Task</h1>

      {error && (
        <div className="bg-red-50 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
            placeholder="What needs to be done?"
            data-testid="task-title-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-[80px]"
            placeholder="Add details..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <button
                key={p}
                type="button"
                className={`flex-1 py-2 rounded-lg capitalize font-medium ${
                  priority === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => setPriority(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quadrant</label>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((q) => {
              const info = QUADRANT_INFO[q]!;
              return (
                <button
                  key={q}
                  type="button"
                  className={`p-3 rounded-lg border text-left ${
                    quadrant === q ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setQuadrant(quadrant === q ? null : q)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: info.color }} />
                    <span className="text-sm font-medium">Q{q} - {info.action}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3"
            placeholder="Comma-separated tags"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700"
            data-testid="save-task-button"
          >
            Save Task
          </button>
        </div>
      </form>
    </div>
  );
}
