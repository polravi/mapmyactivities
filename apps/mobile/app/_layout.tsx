import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@mma/store';

export default function RootLayout() {
  const { status } = useAuthStore();

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        {status === 'authenticated' ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
        <Stack.Screen
          name="task/[id]"
          options={{ headerShown: true, title: 'Task Details', presentation: 'modal' }}
        />
        <Stack.Screen
          name="task/create"
          options={{ headerShown: true, title: 'New Task', presentation: 'modal' }}
        />
      </Stack>
    </>
  );
}
