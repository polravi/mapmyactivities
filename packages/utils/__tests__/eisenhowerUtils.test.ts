import { describe, it, expect } from 'vitest';
import {
  getQuadrantLabel,
  getQuadrantColor,
  isHighConfidence,
  shouldPreselect,
} from '../src/eisenhowerUtils';

describe('eisenhowerUtils', () => {
  describe('getQuadrantLabel', () => {
    it('returns correct labels', () => {
      expect(getQuadrantLabel(1)).toBe('Urgent & Important');
      expect(getQuadrantLabel(2)).toBe('Not Urgent & Important');
      expect(getQuadrantLabel(3)).toBe('Urgent & Not Important');
      expect(getQuadrantLabel(4)).toBe('Not Urgent & Not Important');
    });

    it('returns Unknown for invalid quadrant', () => {
      expect(getQuadrantLabel(5)).toBe('Unknown');
    });
  });

  describe('getQuadrantColor', () => {
    it('returns correct colors', () => {
      expect(getQuadrantColor(1)).toBe('#ef4444');
      expect(getQuadrantColor(2)).toBe('#3b82f6');
      expect(getQuadrantColor(3)).toBe('#eab308');
      expect(getQuadrantColor(4)).toBe('#9ca3af');
    });
  });

  describe('isHighConfidence', () => {
    it('returns true for confidence > 0.7', () => {
      expect(isHighConfidence({ quadrant: 1, confidence: 0.92, reasoning: 'test' })).toBe(true);
    });

    it('returns false for confidence <= 0.7', () => {
      expect(isHighConfidence({ quadrant: 4, confidence: 0.55, reasoning: 'test' })).toBe(false);
    });
  });

  describe('shouldPreselect', () => {
    it('pre-selects high confidence suggestions', () => {
      expect(shouldPreselect({ quadrant: 1, confidence: 0.85, reasoning: 'test' })).toBe(true);
    });

    it('does not pre-select low confidence suggestions', () => {
      expect(shouldPreselect({ quadrant: 4, confidence: 0.5, reasoning: 'test' })).toBe(false);
    });
  });
});
