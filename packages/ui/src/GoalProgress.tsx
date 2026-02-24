import React from 'react';
import { View, Text } from 'react-native';
import type { Goal } from '@mma/types';

interface GoalProgressProps {
  goal: Goal;
  size?: 'sm' | 'md' | 'lg';
  testID?: string;
}

export function GoalProgress({ goal, size = 'md', testID }: GoalProgressProps) {
  const percentage = goal.targetCount > 0
    ? Math.min(100, Math.round((goal.completedCount / goal.targetCount) * 100))
    : 0;

  const barHeight = size === 'sm' ? 'h-1.5' : size === 'md' ? 'h-2.5' : 'h-4';
  const textSize = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';

  const barColor =
    goal.status === 'completed'
      ? 'bg-green-500'
      : percentage >= 75
        ? 'bg-blue-500'
        : percentage >= 50
          ? 'bg-yellow-500'
          : 'bg-gray-400';

  return (
    <View testID={testID} accessibilityLabel={`${goal.title}: ${goal.completedCount} of ${goal.targetCount} completed`}>
      <View className="flex-row justify-between items-center mb-1">
        <Text className={`font-medium text-gray-900 ${textSize}`} numberOfLines={1}>
          {goal.title}
        </Text>
        <Text className={`text-gray-500 ${textSize}`}>
          {goal.completedCount} / {goal.targetCount}
        </Text>
      </View>
      <View className={`w-full bg-gray-200 rounded-full ${barHeight}`}>
        <View
          className={`${barColor} ${barHeight} rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
}
