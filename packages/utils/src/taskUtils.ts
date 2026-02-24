import type { TaskStatus, Task } from '@mma/types';

const STATUS_ORDER: Record<TaskStatus, number> = {
  todo: 0,
  in_progress: 1,
  done: 2,
  discarded: 3,
};

export function canTransitionStatus(from: TaskStatus, to: TaskStatus): boolean {
  if (from === to) return true;
  if (from === 'discarded' && to === 'todo') return true;
  if (from === 'done') return false;
  return STATUS_ORDER[to]! >= STATUS_ORDER[from]!;
}

export function getProgressedStatus(
  serverStatus: TaskStatus,
  clientStatus: TaskStatus,
): TaskStatus {
  if (STATUS_ORDER[clientStatus]! > STATUS_ORDER[serverStatus]!) {
    return clientStatus;
  }
  return serverStatus;
}

export function filterTasksByQuadrant(tasks: Task[], quadrant: number | null): Task[] {
  return tasks.filter((t) => t.eisenhowerQuadrant === quadrant && !t._deleted);
}

export function getUnassignedTasks(tasks: Task[]): Task[] {
  return tasks.filter(
    (t) => t.eisenhowerQuadrant === null && !t._deleted && t.status !== 'discarded',
  );
}

export function getActiveTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => !t._deleted && t.status !== 'discarded');
}

export function sortTasksBySortOrder(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function calculateNewSortOrder(tasks: Task[], targetIndex: number): number {
  const sorted = sortTasksBySortOrder(tasks);
  if (sorted.length === 0) return 1000;
  if (targetIndex === 0) return (sorted[0]?.sortOrder ?? 1000) - 1000;
  if (targetIndex >= sorted.length) return (sorted[sorted.length - 1]?.sortOrder ?? 0) + 1000;
  const before = sorted[targetIndex - 1]!.sortOrder;
  const after = sorted[targetIndex]!.sortOrder;
  return (before + after) / 2;
}
