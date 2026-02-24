import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTaskStore } from '@mma/store';
import { TaskCard } from '@mma/ui';
import { getActiveTasks, sortTasksBySortOrder } from '@mma/utils';
import { VoiceInput } from '@/components/VoiceInput';

export default function TodayScreen() {
  const { tasks, setTaskStatus } = useTaskStore();
  const activeTasks = sortTasksBySortOrder(getActiveTasks(tasks));

  const todayTasks = activeTasks.filter((t) => {
    if (!t.dueDate) return t.goalType === 'daily' || !t.goalType;
    const due = new Date(t.dueDate);
    const today = new Date();
    return (
      due.getFullYear() === today.getFullYear() &&
      due.getMonth() === today.getMonth() &&
      due.getDate() === today.getDate()
    );
  });

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">
          Today
        </Text>
        <Text className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <FlatList
        data={todayTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => router.push(`/task/${item.id}`)}
            onToggleComplete={() =>
              setTaskStatus(item.id, item.status === 'done' ? 'todo' : 'done')
            }
          />
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-gray-400 text-lg">No tasks for today</Text>
            <Text className="text-gray-400 mt-2">Tap + to create one</Text>
          </View>
        }
      />

      <TouchableOpacity
        className="absolute bottom-24 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push('/task/create')}
        accessibilityRole="button"
        accessibilityLabel="Create new task"
        testID="create-task-fab"
      >
        <Text className="text-white text-2xl font-light">+</Text>
      </TouchableOpacity>

      <VoiceInput />
    </View>
  );
}
