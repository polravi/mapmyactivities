import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { Task } from '@mma/types';
import { formatRelativeDate } from '@mma/utils';
import { QuadrantBadge } from './QuadrantBadge';
import { StatusChip } from './StatusChip';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  onToggleComplete?: () => void;
  testID?: string;
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-red-100 text-red-700',
};

export function TaskCard({ task, onPress, onToggleComplete, testID }: TaskCardProps) {
  return (
    <TouchableOpacity
      className={`bg-white rounded-xl p-4 shadow-sm mb-2 ${task.status === 'done' ? 'opacity-60' : ''}`}
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${task.title}, priority ${task.priority}, status ${task.status}${task.dueDate ? `, due ${formatRelativeDate(task.dueDate)}` : ''}`}
    >
      <View className="flex-row items-start">
        <TouchableOpacity
          className={`w-6 h-6 rounded-full border-2 mr-3 mt-0.5 items-center justify-center ${task.status === 'done' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
          onPress={onToggleComplete}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.status === 'done' }}
          accessibilityLabel={`Mark ${task.title} as ${task.status === 'done' ? 'incomplete' : 'complete'}`}
        >
          {task.status === 'done' && (
            <Text className="text-white text-xs font-bold">✓</Text>
          )}
        </TouchableOpacity>

        <View className="flex-1">
          <Text
            className={`text-base font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}
          >
            {task.title}
          </Text>

          <View className="flex-row items-center mt-1.5 gap-2">
            <View className={`px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
              <Text className="text-xs font-medium capitalize">{task.priority}</Text>
            </View>

            {task.eisenhowerQuadrant && (
              <QuadrantBadge quadrant={task.eisenhowerQuadrant} size="sm" />
            )}

            <StatusChip status={task.status} />

            {task.dueDate && (
              <Text className="text-xs text-gray-500">
                {formatRelativeDate(task.dueDate)}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
