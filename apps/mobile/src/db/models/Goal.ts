import { Model } from '@nozbe/watermelondb';
import { field, text, date, readonly } from '@nozbe/watermelondb/decorators';

export class GoalModel extends Model {
  static table = 'goals';

  @text('server_id') serverId!: string | null;
  @text('user_id') userId!: string;
  @text('title') title!: string;
  @text('timeframe') timeframe!: string;
  @field('period_start') periodStart!: number;
  @field('period_end') periodEnd!: number;
  @field('target_count') targetCount!: number;
  @field('completed_count') completedCount!: number;
  @text('status') status!: string;
  @field('is_deleted') isDeleted!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
}
