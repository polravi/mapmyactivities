'use client';

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useTaskStore, useAuthStore } from '@mma/store';
import { filterTasksByQuadrant, getUnassignedTasks, sortTasksBySortOrder } from '@mma/utils';
import { QUADRANT_INFO } from '@mma/types';
import type { Task } from '@mma/types';
import { updateTask } from '@/lib/taskService';

// ── Sortable task card ──────────────────────────────────────────────────────

function SortableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg p-3 shadow-sm mb-2 cursor-grab active:cursor-grabbing select-none"
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full flex-shrink-0 ${
            task.status === 'done' ? 'bg-green-500' : 'bg-gray-200'
          }`}
        />
        <span className={`text-sm flex-1 leading-snug ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
          {task.title}
        </span>
        {task.priority === 'high' && (
          <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">!</span>
        )}
      </div>
      {task.dueDate && (
        <p className="text-xs text-gray-400 mt-1 ml-5">
          {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

// ── Droppable quadrant container ───────────────────────────────────────────

function DroppableQuadrant({
  quadrant,
  tasks,
}: {
  quadrant: number;
  tasks: Task[];
}) {
  const info = QUADRANT_INFO[quadrant]!;
  const { setNodeRef, isOver } = useDroppable({ id: `quadrant-${quadrant}` });
  const sorted = sortTasksBySortOrder(tasks);

  return (
    <div
      ref={setNodeRef}
      className="rounded-xl p-4 min-h-[280px] transition-colors"
      style={{
        backgroundColor: isOver ? info.color + '25' : info.color + '10',
        borderColor: isOver ? info.color : info.color + '60',
        borderWidth: isOver ? 2 : 1,
        borderStyle: 'solid',
      }}
      data-testid={`quadrant-${quadrant}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: info.color }} />
        <h3 className="font-semibold text-gray-800 text-sm">Q{quadrant} — {info.action}</h3>
        <span className="ml-auto text-xs text-gray-400">{sorted.length}</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">{info.label}</p>

      <SortableContext items={sorted.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        {sorted.map((task) => (
          <SortableTask key={task.id} task={task} />
        ))}
        {sorted.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-6">Drop tasks here</p>
        )}
      </SortableContext>
    </div>
  );
}

// ── Main grid ──────────────────────────────────────────────────────────────

export function MatrixGrid() {
  const { tasks, setTaskQuadrant, reorderTask } = useTaskStore();
  const { user } = useAuthStore();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [originalQuadrant, setOriginalQuadrant] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const draggedTask = tasks.find((t) => t.id === draggedTaskId) ?? null;

  function handleDragStart(event: DragStartEvent) {
    const taskId = event.active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    setDraggedTaskId(taskId);
    setOriginalQuadrant(task?.eisenhowerQuadrant ?? null);
  }

  // Live visual feedback — move task to new quadrant as user drags over it
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const quadrantMatch = overId.match(/^quadrant-(\d)$/);
    if (quadrantMatch) {
      const q = parseInt(quadrantMatch[1]!, 10);
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.eisenhowerQuadrant !== q) {
        setTaskQuadrant(taskId, q);
      }
      return;
    }

    // Dragging over another task — move to its quadrant
    const targetTask = tasks.find((t) => t.id === overId);
    if (targetTask) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.eisenhowerQuadrant !== targetTask.eisenhowerQuadrant) {
        setTaskQuadrant(taskId, targetTask.eisenhowerQuadrant);
      }
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    setDraggedTaskId(null);
    setOriginalQuadrant(null);
    const { active, over } = event;
    if (!over || !user) return;

    const taskId = active.id as string;
    const overId = over.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Determine final quadrant
    const quadrantMatch = overId.match(/^quadrant-(\d)$/);
    const targetQuadrant = quadrantMatch
      ? parseInt(quadrantMatch[1]!, 10)
      : tasks.find((t) => t.id === overId)?.eisenhowerQuadrant ?? task.eisenhowerQuadrant;

    // Calculate new sort order if reordering within same quadrant
    let newSortOrder = task.sortOrder;
    if (overId !== taskId && !quadrantMatch) {
      const quadrantTasks = sortTasksBySortOrder(
        filterTasksByQuadrant(tasks, targetQuadrant)
      );
      const oldIndex = quadrantTasks.findIndex((t) => t.id === taskId);
      const newIndex = quadrantTasks.findIndex((t) => t.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(quadrantTasks, oldIndex, newIndex);
        const idx = reordered.findIndex((t) => t.id === taskId);
        const prev = reordered[idx - 1]?.sortOrder ?? (reordered[idx + 1]?.sortOrder ?? 1000) - 1000;
        const next = reordered[idx + 1]?.sortOrder ?? prev + 1000;
        newSortOrder = (prev + next) / 2;
        reorderTask(taskId, newSortOrder);
      }
    }

    // Persist to Firestore — compare against original quadrant (not current Zustand state
    // which was already mutated optimistically by handleDragOver)
    const updates: Record<string, unknown> = {};
    if (targetQuadrant !== originalQuadrant) updates.eisenhowerQuadrant = targetQuadrant;
    if (newSortOrder !== task.sortOrder) updates.sortOrder = newSortOrder;
    if (Object.keys(updates).length > 0) {
      await updateTask(user.id, taskId, updates);
    }
  }

  const unassigned = getUnassignedTasks(tasks);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-2 gap-4 mb-6">
        {([1, 2, 3, 4] as const).map((q) => (
          <DroppableQuadrant
            key={q}
            quadrant={q}
            tasks={filterTasksByQuadrant(tasks, q)}
          />
        ))}
      </div>

      {/* Unassigned tasks */}
      {unassigned.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">
            Unassigned ({unassigned.length}) — drag to a quadrant
          </h3>
          <SortableContext
            items={unassigned.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-2 gap-2">
              {unassigned.map((task) => (
                <SortableTask key={task.id} task={task} />
              ))}
            </div>
          </SortableContext>
        </div>
      )}

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {draggedTask && (
          <div className="bg-white rounded-lg p-3 shadow-xl border-2 border-blue-400 rotate-1 opacity-95">
            <span className="text-sm font-medium">{draggedTask.title}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
