import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore';
import { firestore } from './firestore';
import type { Task, CreateTaskInput, UpdateTaskInput } from '@mma/types';
import { generateId } from '@mma/utils';

function tasksRef(userId: string) {
  return collection(firestore, 'users', userId, 'tasks');
}

function taskRef(userId: string, taskId: string) {
  return doc(firestore, 'users', userId, 'tasks', taskId);
}

export async function createTask(userId: string, input: CreateTaskInput): Promise<Task> {
  const now = new Date().toISOString();
  const task: Task = {
    id: generateId(),
    userId,
    title: input.title,
    description: input.description ?? '',
    status: 'todo',
    eisenhowerQuadrant: input.eisenhowerQuadrant ?? null,
    aiSuggestedQuadrant: null,
    aiConfidence: null,
    goalType: input.goalType ?? null,
    goalId: input.goalId ?? null,
    dueDate: input.dueDate ?? null,
    recurrence: input.recurrence ?? null,
    voiceSource: false,
    voiceTranscript: null,
    priority: input.priority ?? 'medium',
    tags: input.tags ?? [],
    sortOrder: Date.now(),
    _deleted: false,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(taskRef(userId, task.id), task);
  return task;
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput,
): Promise<void> {
  await updateDoc(taskRef(userId, taskId), {
    ...input,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  await updateDoc(taskRef(userId, taskId), {
    _deleted: true,
    updatedAt: new Date().toISOString(),
  });
}

export function subscribeToTasks(
  userId: string,
  onUpdate: (tasks: Task[]) => void,
): Unsubscribe {
  const q = query(
    tasksRef(userId),
    where('_deleted', '==', false),
    orderBy('sortOrder', 'asc'),
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((d) => d.data() as Task);
    onUpdate(tasks);
  });
}
