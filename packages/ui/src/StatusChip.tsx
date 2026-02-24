import React from 'react';
import { View, Text } from 'react-native';
import type { TaskStatus } from '@mma/types';

interface StatusChipProps {
  status: TaskStatus;
  testID?: string;
}

const statusStyles: Record<TaskStatus, { bg: string; text: string; label: string }> = {
  todo: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'To Do' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress' },
  done: { bg: 'bg-green-100', text: 'text-green-700', label: 'Done' },
  discarded: { bg: 'bg-red-100', text: 'text-red-600', label: 'Discarded' },
};

export function StatusChip({ status, testID }: StatusChipProps) {
  const style = statusStyles[status];

  return (
    <View
      className={`px-2 py-0.5 rounded-full ${style.bg}`}
      testID={testID}
      accessibilityLabel={`Status: ${style.label}`}
    >
      <Text className={`text-xs font-medium ${style.text}`}>{style.label}</Text>
    </View>
  );
}
