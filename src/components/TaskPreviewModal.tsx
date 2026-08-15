import React, { useState, useEffect } from 'react';
import { Check, Edit2, X, Calendar, Clock, Sparkles } from 'lucide-react';
import { ExtractedTaskData } from '../types';
import { formatDate, formatTime } from '../utils/date';

interface TaskPreviewModalProps {
  isOpen: boolean;
  data: ExtractedTaskData | null;
  onSave: (finalData: ExtractedTaskData) => void;
  onClose: () => void;
}

export const TaskPreviewModal: React.FC<TaskPreviewModalProps> = ({
  isOpen,
  data,
  onSave,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [taskText, setTaskText] = useState('');
  const [dateText, setDateText] = useState('');
  const [timeText, setTimeText] = useState('');

  useEffect(() => {
    if (data) {
      setTaskText(data.task || '');
      setDateText(data.date || '');
      setTimeText(data.time || '');
      setIsEditing(false);
    }
  }, [data]);

  if (!isOpen || !data) return null;

  const handleSave = () => {
    if (!taskText.trim()) return;
    onSave({
      task: taskText.trim(),
      date: dateText.trim() || null,
      time: timeText.trim() || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            AI Extracted Task
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-2">
          <h2 className="text-xl font-bold text-slate-900">Review Task</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gemini converted your voice command into structured task attributes.
          </p>

          {!isEditing ? (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Task Title
                </span>
                <p className="text-base font-semibold text-slate-800 break-words">{taskText}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Date
                    </span>
                    <span className="text-sm font-medium text-slate-800">
                      {dateText ? formatDate(dateText) : 'None'}
                    </span>
                    {dateText && (
                      <span className="text-xs text-slate-400 block">({dateText})</span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Time
                    </span>
                    <span className="text-sm font-medium text-slate-800">
                      {timeText ? formatTime(timeText) : 'None'}
                    </span>
                    {timeText && (
                      <span className="text-xs text-slate-400 block">({timeText})</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Task title"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    value={dateText}
                    onChange={(e) => setDateText(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Time (HH:mm)
                  </label>
                  <input
                    type="time"
                    value={timeText}
                    onChange={(e) => setTimeText(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 pt-4 flex flex-col gap-2.5">
          <button
            id="save-extracted-task-modal-btn"
            type="button"
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-semibold shadow-md transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            Save Task
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              {isEditing ? 'Done Editing' : 'Edit Details'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
