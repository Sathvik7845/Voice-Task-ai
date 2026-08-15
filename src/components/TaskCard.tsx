import React from 'react';
import { Check, Trash2, Calendar, Clock, Edit3 } from 'lucide-react';
import { Task } from '../types';
import { formatDate, formatTime } from '../utils/date';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect: (task: Task) => void;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onSelect,
  onEdit,
}) => {
  return (
    <div
      id={`task-card-${task.id}`}
      onClick={() => onSelect(task)}
      className={`group relative flex items-start gap-3.5 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        task.completed
          ? 'bg-slate-50/80 border-slate-200/80 opacity-75'
          : 'bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-md shadow-xs'
      }`}
    >
      {/* Checkbox button */}
      <button
        id={`toggle-task-${task.id}`}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete(task.id);
        }}
        className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-colors shrink-0 ${
          task.completed
            ? 'bg-emerald-500 text-white'
            : 'border-2 border-slate-300 hover:border-blue-500 bg-white'
        }`}
        title={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-[15px] font-medium leading-snug break-words ${
            task.completed ? 'line-through text-slate-400' : 'text-slate-800'
          }`}
        >
          {task.task}
        </p>

        {/* Date & Time Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {task.date && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              {formatDate(task.date)}
            </span>
          )}

          {task.time && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              {formatTime(task.time)}
            </span>
          )}

          {!task.date && !task.time && (
            <span className="text-xs text-slate-400 italic">No due date</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id={`edit-task-${task.id}`}
          type="button"
          onClick={() => onEdit(task)}
          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit task"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          id={`delete-task-${task.id}`}
          type="button"
          onClick={() => onDelete(task.id)}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
