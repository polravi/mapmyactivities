import type { GoalType } from '@mma/types';

export function getToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function toISOString(date: Date): string {
  return date.toISOString();
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < getToday();
}

export function getDaysUntilDue(dueDate: string | null): number | null {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const today = getToday();
  const diffMs = due.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function getPeriodBounds(
  timeframe: GoalType,
  referenceDate: Date = new Date(),
): { start: Date; end: Date } {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const date = referenceDate.getDate();
  const day = referenceDate.getDay();

  switch (timeframe) {
    case 'daily':
      return {
        start: new Date(year, month, date),
        end: new Date(year, month, date, 23, 59, 59, 999),
      };
    case 'weekly': {
      const weekStart = new Date(year, month, date - day);
      const weekEnd = new Date(year, month, date + (6 - day), 23, 59, 59, 999);
      return { start: weekStart, end: weekEnd };
    }
    case 'monthly':
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month + 1, 0, 23, 59, 59, 999),
      };
    case 'yearly':
      return {
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31, 23, 59, 59, 999),
      };
  }
}

export function getNextOccurrence(
  recurrenceType: GoalType,
  interval: number,
  daysOfWeek: number[] | undefined,
  currentDate: Date = new Date(),
): Date {
  const next = new Date(currentDate);

  switch (recurrenceType) {
    case 'daily':
      next.setDate(next.getDate() + interval);
      break;
    case 'weekly':
      if (daysOfWeek && daysOfWeek.length > 0) {
        const currentDay = next.getDay();
        const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
        const nextDay = sortedDays.find((d) => d > currentDay);
        if (nextDay !== undefined) {
          next.setDate(next.getDate() + (nextDay - currentDay));
        } else {
          next.setDate(next.getDate() + (7 - currentDay + sortedDays[0]!));
        }
      } else {
        next.setDate(next.getDate() + 7 * interval);
      }
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + interval);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + interval);
      break;
  }

  return next;
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = getToday();
  const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  return date.toLocaleDateString();
}
