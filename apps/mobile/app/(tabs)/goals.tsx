import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useGoalStore, useTaskStore } from '@mma/store';
import { GoalProgress } from '@mma/ui';
import type { GoalType } from '@mma/types';

const TIMEFRAMES: { key: GoalType; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

export default function GoalsScreen() {
  const { goals, activeTimeframe, setActiveTimeframe } = useGoalStore();
  const filteredGoals = goals.filter(
    (g) => g.timeframe === activeTimeframe && !g._deleted,
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Timeframe tabs */}
      <View className="flex-row bg-white border-b border-gray-200 px-2">
        {TIMEFRAMES.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            className={`flex-1 py-3 items-center ${activeTimeframe === key ? 'border-b-2 border-blue-600' : ''}`}
            onPress={() => setActiveTimeframe(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTimeframe === key }}
          >
            <Text
              className={`font-medium ${activeTimeframe === key ? 'text-blue-600' : 'text-gray-500'}`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredGoals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <GoalProgress goal={item} size="md" />
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-gray-400 text-lg">No {activeTimeframe} goals</Text>
            <Text className="text-gray-400 mt-2">Tap + to create one</Text>
          </View>
        }
      />
    </View>
  );
}
