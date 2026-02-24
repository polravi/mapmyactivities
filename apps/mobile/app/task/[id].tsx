import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTaskStore } from '@mma/store';
import { Button, QuadrantBadge, StatusChip } from '@mma/ui';
import { formatRelativeDate } from '@mma/utils';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, deleteTask, setTaskStatus } = useTaskStore();
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-400">Task not found</Text>
      </View>
    );
  }

  function handleDelete() {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTask(task!.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-4">
      <Text className="text-2xl font-bold text-gray-900 mb-2">{task.title}</Text>

      <View className="flex-row items-center gap-2 mb-4">
        <StatusChip status={task.status} />
        {task.eisenhowerQuadrant && (
          <QuadrantBadge quadrant={task.eisenhowerQuadrant} size="md" showLabel />
        )}
      </View>

      {task.description && (
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-500 mb-1">Description</Text>
          <Text className="text-base text-gray-700">{task.description}</Text>
        </View>
      )}

      <View className="flex-row mb-4">
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-500 mb-1">Priority</Text>
          <Text className="text-base capitalize">{task.priority}</Text>
        </View>
        {task.dueDate && (
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-500 mb-1">Due Date</Text>
            <Text className="text-base">{formatRelativeDate(task.dueDate)}</Text>
          </View>
        )}
      </View>

      {task.tags.length > 0 && (
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-500 mb-1">Tags</Text>
          <View className="flex-row flex-wrap gap-1">
            {task.tags.map((tag) => (
              <View key={tag} className="bg-gray-100 px-2 py-1 rounded-full">
                <Text className="text-xs text-gray-600">{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {task.voiceSource && task.voiceTranscript && (
        <View className="mb-4 bg-purple-50 p-3 rounded-lg">
          <Text className="text-sm font-medium text-purple-700 mb-1">Voice Transcript</Text>
          <Text className="text-sm text-purple-600 italic">"{task.voiceTranscript}"</Text>
        </View>
      )}

      <View className="gap-3 mt-6 mb-8">
        {task.status !== 'done' && (
          <Button
            title="Mark as Done"
            onPress={() => setTaskStatus(task.id, 'done')}
            testID="mark-done-button"
          />
        )}
        {task.status === 'done' && (
          <Button
            title="Reopen"
            variant="secondary"
            onPress={() => setTaskStatus(task.id, 'todo')}
          />
        )}
        <Button
          title="Delete"
          variant="danger"
          onPress={handleDelete}
          testID="delete-task-button"
        />
      </View>
    </ScrollView>
  );
}
