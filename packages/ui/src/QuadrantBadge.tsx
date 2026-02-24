import React from 'react';
import { View, Text } from 'react-native';
import { getQuadrantLabel, getQuadrantAction, getQuadrantColor } from '@mma/utils';

interface QuadrantBadgeProps {
  quadrant: number;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  aiSuggested?: boolean;
  testID?: string;
}

export function QuadrantBadge({
  quadrant,
  size = 'sm',
  showLabel = false,
  aiSuggested = false,
  testID,
}: QuadrantBadgeProps) {
  const color = getQuadrantColor(quadrant);
  const action = getQuadrantAction(quadrant);
  const label = getQuadrantLabel(quadrant);

  return (
    <View
      className="flex-row items-center"
      testID={testID}
      accessibilityLabel={`Quadrant ${quadrant}: ${label} - ${action}${aiSuggested ? ' (AI suggested)' : ''}`}
    >
      <View
        className={`rounded-full ${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`}
        style={{ backgroundColor: color }}
      />
      {showLabel && (
        <Text className={`ml-1.5 font-medium text-gray-700 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          Q{quadrant} - {action}
        </Text>
      )}
      {aiSuggested && (
        <View className="ml-1 bg-purple-100 px-1.5 py-0.5 rounded">
          <Text className="text-purple-700 text-[10px] font-medium">AI</Text>
        </View>
      )}
    </View>
  );
}
