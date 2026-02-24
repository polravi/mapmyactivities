import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useTaskStore, useMatrixStore } from '@mma/store';
import { filterTasksByQuadrant, getUnassignedTasks } from '@mma/utils';
import { TaskCard, QuadrantBadge } from '@mma/ui';
import { QUADRANT_INFO } from '@mma/types';

export default function MatrixScreen() {
  const { tasks, setTaskStatus } = useTaskStore();

  const quadrants = [1, 2, 3, 4] as const;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-row flex-wrap p-2">
        {quadrants.map((q) => {
          const info = QUADRANT_INFO[q]!;
          const quadrantTasks = filterTasksByQuadrant(tasks, q);

          return (
            <View
              key={q}
              className="w-1/2 p-2"
              testID={`quadrant-${q}`}
            >
              <View
                className="rounded-xl p-3 min-h-[200px]"
                style={{ backgroundColor: info.color + '15' }}
              >
                <View className="flex-row items-center mb-2">
                  <QuadrantBadge quadrant={q} size="md" showLabel />
                </View>
                <Text className="text-xs text-gray-500 mb-3">{info.action}</Text>

                {quadrantTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onPress={() => router.push(`/task/${task.id}`)}
                    onToggleComplete={() =>
                      setTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')
                    }
                  />
                ))}

                {quadrantTasks.length === 0 && (
                  <Text className="text-gray-400 text-xs text-center py-4">
                    No tasks
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Unassigned tasks */}
      <View className="px-4 pb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-3">Unassigned</Text>
        {getUnassignedTasks(tasks).map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onPress={() => router.push(`/task/${task.id}`)}
            onToggleComplete={() =>
              setTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')
            }
          />
        ))}
      </View>
    </ScrollView>
  );
}
