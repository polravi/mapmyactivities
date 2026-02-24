'use client';

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTaskStore, useMatrixStore } from '@mma/store';
import { filterTasksByQuadrant, getUnassignedTasks, calculateNewSortOrder } from '@mma/utils';
import { QUADRANT_INFO } from '@mma/types';
import type { Task } from '@mma/types';

interface SortableTaskProps {
  task: Task;
  onToggleComplete: () => void;
}

function SortableTask({ task, onToggleComplete }: SortableTaskProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg p-3 shadow-sm mb-2 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-2">
        <button
          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
            task.status === 'done'
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete();
          }}
          aria-label={`Mark "${task.title}" as ${task.status === 'done' ? 'incomplete' : 'complete'}`}
        />
        <span
          className={`text-sm flex-1 ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}
        >
          {task.title}
        </span>
      </div>
    </div>
  );
}

export function MatrixGrid() {
  const { tasks, setTaskQuadrant, setTaskStatus, reorderTask } = useTaskStore();
  const { draggedTaskId, setDraggedTask } = useMatrixStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const quadrants = [1, 2, 3, 4] as const;
  const unassigned = getUnassignedTasks(tasks);
  const draggedTask = tasks.find((t) => t.id === draggedTaskId);

  function handleDragStart(event: DragStartEvent) {
    setDraggedTask(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggedTask(null);
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a quadrant container
    const quadrantMatch = overId.match(/^quadrant-(\d)$/);
    if (quadrantMatch) {
      const quadrant = parseInt(quadrantMatch[1]!, 10);
      setTaskQuadrant(taskId, quadrant);
      return;
    }

    // Dropped on another task — move to that task's quadrant
    const targetTask = tasks.find((t) => t.id === overId);
    if (targetTask && targetTask.eisenhowerQuadrant) {
      setTaskQuadrant(taskId, targetTask.eisenhowerQuadrant);
      const quadrantTasks = filterTasksByQuadrant(tasks, targetTask.eisenhowerQuadrant);
      const targetIndex = quadrantTasks.findIndex((t) => t.id === overId);
      const newOrder = calculateNewSortOrder(quadrantTasks, targetIndex);
      reorderTask(taskId, newOrder);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-2 gap-4 mb-6">
        {quadrants.map((q) => {
          const info = QUADRANT_INFO[q]!;
          const quadrantTasks = filterTasksByQuadrant(tasks, q);

          return (
            <SortableContext
              key={q}
              items={quadrantTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div
                id={`quadrant-${q}`}
                className="rounded-xl p-4 min-h-[250px]"
                style={{ backgroundColor: info.color + '10', borderColor: info.color, borderWidth: 1 }}
                data-testid={`quadrant-${q}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: info.color }}
                  />
                  <h3 className="font-semibold text-gray-800">
                    Q{q} - {info.action}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mb-3">{info.label}</p>

                {quadrantTasks.map((task) => (
                  <SortableTask
                    key={task.id}
                    task={task}
                    onToggleComplete={() =>
                      setTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')
                    }
                  />
                ))}
              </div>
            </SortableContext>
          );
        })}
      </div>

      {/* Unassigned tasks */}
      {unassigned.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">
            Unassigned ({unassigned.length})
          </h3>
          <SortableContext
            items={unassigned.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-2 gap-2">
              {unassigned.map((task) => (
                <SortableTask
                  key={task.id}
                  task={task}
                  onToggleComplete={() =>
                    setTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')
                  }
                />
              ))}
            </div>
          </SortableContext>
        </div>
      )}

      <DragOverlay>
        {draggedTask && (
          <div className="bg-white rounded-lg p-3 shadow-lg border-2 border-blue-400">
            <span className="text-sm">{draggedTask.title}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
