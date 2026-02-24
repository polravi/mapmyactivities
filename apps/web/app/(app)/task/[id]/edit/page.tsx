'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore, useTaskStore } from '@mma/store';
import { UpdateTaskInputSchema, QUADRANT_INFO } from '@mma/types';
import type { TaskPriority } from '@mma/types';
import { updateTask } from '@/lib/taskService';

export default function EditTaskPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { tasks } = useTaskStore();

  const task = tasks.find((t) => t.id === id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [quadrant, setQuadrant] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setPriority(task.priority);
      setQuadrant(task.eisenhowerQuadrant);
      setDueDate(task.dueDate ? task.dueDate.split('T')[0]! : '');
      setTags(task.tags.join(', '));
    }
  }, [task]);

  if (!task) {
    return (
      <div className="max-w-xl">
        <p className="text-gray-500">Task not found.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const result = UpdateTaskInputSchema.safeParse({
      title,
      description: description || undefined,
      priority,
      eisenhowerQuadrant: quadrant,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    if (!user) return;

    setSaving(true);
    try {
      await updateTask(user.id, id, result.data);
      router.push('/dashboard');
    } catch {
      setError('Failed to update task. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Task</h1>

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
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`flex-1 py-2 rounded-lg capitalize text-sm font-medium ${
                    priority === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setPriority(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
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
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    quadrant === q ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setQuadrant(quadrant === q ? null : q)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: info.color }} />
                    <span className="text-sm font-medium">Q{q} — {info.action}</span>
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
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="work, urgent, personal (comma-separated)"
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
            disabled={saving}
            className="flex-1 bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
