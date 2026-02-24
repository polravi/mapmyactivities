import { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTaskStore, useAuthStore, useMatrixStore } from '@mma/store';
import { Button, QuadrantBadge } from '@mma/ui';
import { CreateTaskInputSchema } from '@mma/types';
import type { TaskPriority, GoalType } from '@mma/types';

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];
const GOAL_TYPES: GoalType[] = ['daily', 'weekly', 'monthly', 'yearly'];

export default function CreateTaskScreen() {
  const { addTask } = useTaskStore();
  const { user } = useAuthStore();
  const { aiSuggestion } = useMatrixStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [selectedQuadrant, setSelectedQuadrant] = useState<number | null>(
    aiSuggestion?.quadrant ?? null,
  );
  const [goalType, setGoalType] = useState<GoalType | null>(null);
  const [tags, setTags] = useState('');

  function handleSave() {
    const result = CreateTaskInputSchema.safeParse({
      title,
      description: description || undefined,
      priority,
      eisenhowerQuadrant: selectedQuadrant,
      goalType,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    });

    if (!result.success) {
      const firstError = result.error.issues[0];
      Alert.alert('Validation Error', firstError?.message ?? 'Invalid input');
      return;
    }

    addTask(result.data, user?.id ?? '');
    router.back();
  }

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-4">
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
        placeholder="Task title *"
        value={title}
        onChangeText={setTitle}
        testID="task-title-input"
        accessibilityLabel="Task title"
      />

      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base min-h-[80px]"
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
        multiline
        textAlignVertical="top"
        accessibilityLabel="Task description"
      />

      {/* Priority */}
      <Text className="text-sm font-medium text-gray-700 mb-2">Priority</Text>
      <View className="flex-row gap-2 mb-4">
        {PRIORITIES.map((p) => (
          <TouchableOpacity
            key={p}
            className={`flex-1 py-2 rounded-lg items-center ${priority === p ? 'bg-blue-600' : 'bg-gray-100'}`}
            onPress={() => setPriority(p)}
          >
            <Text className={`capitalize font-medium ${priority === p ? 'text-white' : 'text-gray-700'}`}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quadrant picker */}
      <Text className="text-sm font-medium text-gray-700 mb-2">
        Eisenhower Quadrant
        {aiSuggestion && ' (AI suggested)'}
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {[1, 2, 3, 4].map((q) => (
          <TouchableOpacity
            key={q}
            className={`flex-1 min-w-[45%] py-3 rounded-lg items-center ${selectedQuadrant === q ? 'border-2 border-blue-600' : 'border border-gray-200'}`}
            onPress={() => setSelectedQuadrant(q)}
          >
            <QuadrantBadge
              quadrant={q}
              size="md"
              showLabel
              aiSuggested={aiSuggestion?.quadrant === q}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Goal type */}
      <Text className="text-sm font-medium text-gray-700 mb-2">Goal Type (optional)</Text>
      <View className="flex-row gap-2 mb-4">
        {GOAL_TYPES.map((gt) => (
          <TouchableOpacity
            key={gt}
            className={`flex-1 py-2 rounded-lg items-center ${goalType === gt ? 'bg-blue-600' : 'bg-gray-100'}`}
            onPress={() => setGoalType(goalType === gt ? null : gt)}
          >
            <Text className={`capitalize text-sm font-medium ${goalType === gt ? 'text-white' : 'text-gray-700'}`}>
              {gt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tags */}
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-6 text-base"
        placeholder="Tags (comma-separated)"
        value={tags}
        onChangeText={setTags}
        accessibilityLabel="Tags"
      />

      <View className="flex-row gap-3 mb-8">
        <View className="flex-1">
          <Button title="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
        <View className="flex-1">
          <Button title="Save" onPress={handleSave} testID="save-task-button" />
        </View>
      </View>
    </ScrollView>
  );
}
