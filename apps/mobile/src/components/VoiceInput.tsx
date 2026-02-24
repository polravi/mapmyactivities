import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { useVoiceCapture } from '@/hooks/useVoiceCapture';
import { useTaskStore, useAuthStore } from '@mma/store';
import { Button } from '@mma/ui';
import type { ParsedVoiceTask, VoiceState } from '@mma/types';

export function VoiceInput() {
  const { user } = useAuthStore();
  const { addTask } = useTaskStore();
  const {
    state,
    transcript,
    parsedTask,
    error,
    startListening,
    stopListening,
    reset,
  } = useVoiceCapture();

  const [editedTitle, setEditedTitle] = useState('');
  const [editedPriority, setEditedPriority] = useState('medium');

  const showConfirmation = state === 'confirming' && parsedTask;

  function handleConfirm() {
    if (!parsedTask || !user) return;

    addTask(
      {
        title: editedTitle || parsedTask.title,
        description: parsedTask.description,
        priority: editedPriority as 'low' | 'medium' | 'high',
        dueDate: parsedTask.dueDate,
        goalType: parsedTask.goalType,
        tags: parsedTask.tags,
      },
      user.id,
    );

    reset();
  }

  function handleStartVoice() {
    startListening();
  }

  // Update edited fields when parsed task arrives
  if (parsedTask && !editedTitle) {
    setEditedTitle(parsedTask.title);
    if (parsedTask.priority) setEditedPriority(parsedTask.priority);
  }

  return (
    <>
      {/* Voice FAB */}
      <TouchableOpacity
        className={`absolute bottom-24 left-6 w-14 h-14 rounded-full items-center justify-center shadow-lg ${
          state === 'listening' ? 'bg-red-500' : 'bg-purple-600'
        }`}
        onPress={state === 'listening' ? stopListening : handleStartVoice}
        testID="voice-button"
        accessibilityRole="button"
        accessibilityLabel={state === 'listening' ? 'Stop recording' : 'Start voice input'}
      >
        <Text className="text-white text-xl">🎤</Text>
      </TouchableOpacity>

      {/* Listening overlay */}
      {state === 'listening' && (
        <View className="absolute bottom-40 left-4 right-4 bg-white rounded-xl p-4 shadow-lg">
          <View className="flex-row items-center mb-2">
            <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
            <Text className="text-sm font-medium text-gray-700">Listening...</Text>
          </View>
          <Text className="text-base text-gray-900">{transcript || 'Speak now...'}</Text>
        </View>
      )}

      {/* Processing indicator */}
      {state === 'processing' && (
        <View className="absolute bottom-40 left-4 right-4 bg-white rounded-xl p-4 shadow-lg">
          <Text className="text-sm text-gray-500">Processing your voice input...</Text>
        </View>
      )}

      {/* Error state */}
      {state === 'error' && error && (
        <View className="absolute bottom-40 left-4 right-4 bg-white rounded-xl p-4 shadow-lg">
          <Text className="text-sm text-red-600 mb-3">{error}</Text>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Button title="Try Again" size="sm" onPress={handleStartVoice} />
            </View>
            <View className="flex-1">
              <Button title="Cancel" variant="ghost" size="sm" onPress={reset} />
            </View>
          </View>
        </View>
      )}

      {/* Confirmation modal */}
      <Modal visible={!!showConfirmation} animationType="slide" transparent>
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-2xl p-6 shadow-2xl">
            <Text className="text-lg font-bold mb-1">Confirm Task</Text>
            {transcript && (
              <Text className="text-xs text-gray-400 italic mb-4">
                "{transcript}"
              </Text>
            )}

            <Text className="text-sm font-medium text-gray-700 mb-1">Title</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 mb-3 text-base"
              value={editedTitle}
              onChangeText={setEditedTitle}
            />

            {parsedTask?.dueDate && (
              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-700 mb-1">Due Date</Text>
                <Text className="text-base text-gray-900">
                  {new Date(parsedTask.dueDate).toLocaleDateString()}
                </Text>
              </View>
            )}

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">Priority</Text>
              <View className="flex-row gap-2">
                {['low', 'medium', 'high'].map((p) => (
                  <TouchableOpacity
                    key={p}
                    className={`flex-1 py-2 rounded-lg items-center ${editedPriority === p ? 'bg-blue-600' : 'bg-gray-100'}`}
                    onPress={() => setEditedPriority(p)}
                  >
                    <Text
                      className={`capitalize text-sm font-medium ${editedPriority === p ? 'text-white' : 'text-gray-700'}`}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Button title="Cancel" variant="secondary" onPress={reset} />
              </View>
              <View className="flex-1">
                <Button title="Save" onPress={handleConfirm} testID="voice-save-button" />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
