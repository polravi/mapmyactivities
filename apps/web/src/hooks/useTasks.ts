'use client';

import { useEffect } from 'react';
import { useAuthStore, useTaskStore } from '@mma/store';
import { subscribeToTasks } from '@/lib/taskService';

export function useTasks() {
  const { user, status } = useAuthStore();
  const { setTasks, setLoading } = useTaskStore();

  useEffect(() => {
    if (status !== 'authenticated' || !user) return;

    setLoading(true);
    const unsubscribe = subscribeToTasks(user.id, (tasks) => {
      setTasks(tasks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, status, setTasks, setLoading]);
}
