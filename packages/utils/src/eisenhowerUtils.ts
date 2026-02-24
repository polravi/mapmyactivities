import { QUADRANT_INFO } from '@mma/types';
import type { AISuggestion } from '@mma/types';

export function getQuadrantLabel(quadrant: number): string {
  return QUADRANT_INFO[quadrant]?.label ?? 'Unknown';
}

export function getQuadrantColor(quadrant: number): string {
  return QUADRANT_INFO[quadrant]?.color ?? '#9ca3af';
}

export function getQuadrantAction(quadrant: number): string {
  return QUADRANT_INFO[quadrant]?.action ?? 'Unknown';
}

export function isHighConfidence(suggestion: AISuggestion): boolean {
  return suggestion.confidence > 0.7;
}

export function shouldPreselect(suggestion: AISuggestion): boolean {
  return isHighConfidence(suggestion);
}
