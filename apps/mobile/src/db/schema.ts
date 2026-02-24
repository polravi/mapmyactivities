import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'server_id', type: 'string', isOptional: true },
        { name: 'user_id', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'eisenhower_quadrant', type: 'number', isOptional: true },
        { name: 'ai_suggested_quadrant', type: 'number', isOptional: true },
        { name: 'ai_confidence', type: 'number', isOptional: true },
        { name: 'goal_type', type: 'string', isOptional: true },
        { name: 'goal_id', type: 'string', isOptional: true },
        { name: 'due_date', type: 'number', isOptional: true },
        { name: 'recurrence', type: 'string', isOptional: true }, // JSON serialized
        { name: 'voice_source', type: 'boolean' },
        { name: 'voice_transcript', type: 'string', isOptional: true },
        { name: 'priority', type: 'string' },
        { name: 'tags', type: 'string' }, // JSON serialized array
        { name: 'sort_order', type: 'number' },
        { name: 'is_deleted', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'goals',
      columns: [
        { name: 'server_id', type: 'string', isOptional: true },
        { name: 'user_id', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'timeframe', type: 'string' },
        { name: 'period_start', type: 'number' },
        { name: 'period_end', type: 'number' },
        { name: 'target_count', type: 'number' },
        { name: 'completed_count', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'is_deleted', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
