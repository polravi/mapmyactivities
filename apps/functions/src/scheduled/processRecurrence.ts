import { scheduler } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { generateId } from '@mma/utils';

export const processRecurrence = scheduler.onSchedule(
  { schedule: 'every day 00:05', timeZone: 'UTC' },
  async () => {
    const db = admin.firestore();
    const today = new Date();
    const dayOfWeek = today.getDay();

    // Find all tasks with recurrence
    const recurringTasks = await db
      .collectionGroup('tasks')
      .where('recurrence', '!=', null)
      .where('_deleted', '==', false)
      .get();

    const batch = db.batch();

    for (const doc of recurringTasks.docs) {
      const task = doc.data();
      const recurrence = task.recurrence;

      if (!recurrence) continue;

      // Check if past end date
      if (recurrence.endDate && new Date(recurrence.endDate) < today) {
        continue;
      }

      // Check if this task should generate an instance today
      let shouldCreate = false;

      switch (recurrence.type) {
        case 'daily':
          shouldCreate = true;
          break;
        case 'weekly':
          if (recurrence.daysOfWeek?.includes(dayOfWeek)) {
            shouldCreate = true;
          }
          break;
        case 'monthly':
          if (today.getDate() === new Date(task.createdAt).getDate()) {
            shouldCreate = true;
          }
          break;
        case 'yearly':
          if (
            today.getDate() === new Date(task.createdAt).getDate() &&
            today.getMonth() === new Date(task.createdAt).getMonth()
          ) {
            shouldCreate = true;
          }
          break;
      }

      if (shouldCreate) {
        const parentPath = doc.ref.parent.path;
        const newTaskId = generateId();
        const now = today.toISOString();

        const newTask = {
          ...task,
          id: newTaskId,
          status: 'todo',
          dueDate: now,
          _deleted: false,
          createdAt: now,
          updatedAt: now,
          // Don't copy recurrence to instance
          recurrence: null,
          // Link back to parent recurring task
          parentTaskId: doc.id,
        };

        const newRef = db.collection(parentPath).doc(newTaskId);
        batch.set(newRef, newTask);
      }
    }

    await batch.commit();
  },
);
