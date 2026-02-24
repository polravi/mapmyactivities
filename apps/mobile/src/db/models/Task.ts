import { Model } from '@nozbe/watermelondb';
import { field, text, date, json, readonly } from '@nozbe/watermelondb/decorators';

export class TaskModel extends Model {
  static table = 'tasks';

  @text('server_id') serverId!: string | null;
  @text('user_id') userId!: string;
  @text('title') title!: string;
  @text('description') description!: string;
  @text('status') status!: string;
  @field('eisenhower_quadrant') eisenhowerQuadrant!: number | null;
  @field('ai_suggested_quadrant') aiSuggestedQuadrant!: number | null;
  @field('ai_confidence') aiConfidence!: number | null;
  @text('goal_type') goalType!: string | null;
  @text('goal_id') goalId!: string | null;
  @field('due_date') dueDate!: number | null;
  @json('recurrence', (raw) => raw) recurrence!: unknown | null;
  @field('voice_source') voiceSource!: boolean;
  @text('voice_transcript') voiceTranscript!: string | null;
  @text('priority') priority!: string;
  @json('tags', (raw) => raw) tags!: string[];
  @field('sort_order') sortOrder!: number;
  @field('is_deleted') isDeleted!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
}
