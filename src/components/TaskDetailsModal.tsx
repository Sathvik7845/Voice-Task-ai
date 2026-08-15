import React, { useState, useEffect } from 'react';
import { Check, Trash2, Calendar, Clock, Edit2, X, Save } from 'lucide-react';
import { Task } from '../types';
import { formatDate, formatTime } from '../utils/date';

interface TaskDetailsModalProps {
  task: Task | null;
  isOpen: boolean;
  onToggleComplete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  isOpen,
  onToggleComplete,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (task) {
      setTaskName(task.task);
      setDate(task.date || '');
      setTime(task.time || '');
      setIsEditing(false);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = () => {
    if (!taskName.trim()) return;
    onUpdate(task.id, {
      task: taskName.trim(),
      date: date.trim() || null,
      time: time.trim() || null,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {isEditing ? 'Edit Task' : 'Task Details'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status card */}
        <div className="p-6 pb-2 space-y-4">
          <div
            onClick={() => onToggleComplete(task.id)}
            className={`flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-colors ${
              task.completed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                task.completed
                  ? 'bg-emerald-500 text-white'
                  : 'border-2 border-slate-300 bg-white'
              }`}
            >
              {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div>
              <p className="text-sm font-semibold">
                {task.completed ? 'Task Completed' : 'Task In Progress'}
              </p>
              <p className="text-xs text-slate-500">
                {task.completed ? 'Click to mark as pending' : 'Click to mark as completed'}
              </p>
            </div>
          </div>

          {!isEditing ? (
            <div className="space-y-4 bg-white p-2">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Task Title
                </span>
                <p
                  className={`text-base font-semibold ${
                    task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}
                >
                  {task.task}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Due Date
                    </span>
                    <span className="text-sm font-medium text-slate-800">
                      {formatDate(task.date)}
                    </span>
                    {task.date && (
                      <span className="text-xs text-slate-400 block">({task.date})</span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Time
                    </span>
                    <span className="text-sm font-medium text-slate-800">
                      {formatTime(task.time)}
                    </span>
                    {task.time && (
                      <span className="text-xs text-slate-400 block">({task.time})</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-400">
                Created: {new Date(task.createdAt).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Description
                </label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            id="delete-task-modal-btn"
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
