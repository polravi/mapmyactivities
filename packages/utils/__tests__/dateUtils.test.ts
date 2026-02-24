import { describe, it, expect } from 'vitest';
import {
  isOverdue,
  getDaysUntilDue,
  getPeriodBounds,
  getNextOccurrence,
  formatRelativeDate,
} from '../src/dateUtils';

describe('dateUtils', () => {
  describe('isOverdue', () => {
    it('returns false for null date', () => {
      expect(isOverdue(null)).toBe(false);
    });

    it('returns true for past date', () => {
      expect(isOverdue('2020-01-01T00:00:00.000Z')).toBe(true);
    });

    it('returns false for future date', () => {
      expect(isOverdue('2030-01-01T00:00:00.000Z')).toBe(false);
    });
  });

  describe('getDaysUntilDue', () => {
    it('returns null for null date', () => {
      expect(getDaysUntilDue(null)).toBe(null);
    });

    it('returns positive for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const days = getDaysUntilDue(futureDate.toISOString());
      expect(days).toBeGreaterThanOrEqual(4);
      expect(days).toBeLessThanOrEqual(6);
    });
  });

  describe('getPeriodBounds', () => {
    const ref = new Date(2026, 5, 15); // June 15, 2026

    it('returns correct daily bounds', () => {
      const { start, end } = getPeriodBounds('daily', ref);
      expect(start.getDate()).toBe(15);
      expect(end.getDate()).toBe(15);
    });

    it('returns correct monthly bounds', () => {
      const { start, end } = getPeriodBounds('monthly', ref);
      expect(start.getDate()).toBe(1);
      expect(end.getDate()).toBe(30);
    });

    it('returns correct yearly bounds', () => {
      const { start, end } = getPeriodBounds('yearly', ref);
      expect(start.getMonth()).toBe(0);
      expect(end.getMonth()).toBe(11);
    });
  });

  describe('getNextOccurrence', () => {
    it('adds days for daily recurrence', () => {
      const base = new Date(2026, 0, 1);
      const next = getNextOccurrence('daily', 1, undefined, base);
      expect(next.getDate()).toBe(2);
    });

    it('adds months for monthly recurrence', () => {
      const base = new Date(2026, 0, 15);
      const next = getNextOccurrence('monthly', 1, undefined, base);
      expect(next.getMonth()).toBe(1);
    });

    it('handles weekly with specific days', () => {
      const monday = new Date(2026, 0, 5); // Monday
      const next = getNextOccurrence('weekly', 1, [3, 5], monday); // Wed, Fri
      expect(next.getDay()).toBe(3); // Wednesday
    });
  });

  describe('formatRelativeDate', () => {
    it('returns "Today" for today', () => {
      expect(formatRelativeDate(new Date().toISOString())).toBe('Today');
    });
  });
});
