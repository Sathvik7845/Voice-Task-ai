import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  CalendarDays,
  CheckCircle2,
  Clock,
  Volume2,
  Send,
  Smartphone,
  Monitor,
  RefreshCw,
  HelpCircle,
  Search,
  Filter,
} from 'lucide-react';

import { Task, ExtractedTaskData, TaskFilter } from './types';
import { storage } from './services/storage';
import { api } from './services/api';
import { WebSpeechRecognizer } from './services/speech';
import { VoiceButton } from './components/VoiceButton';
import { TaskCard } from './components/TaskCard';
import { TaskPreviewModal } from './components/TaskPreviewModal';
import { TaskDetailsModal } from './components/TaskDetailsModal';
import { AddTaskModal } from './components/AddTaskModal';
import { EmptyState } from './components/EmptyState';
import { LoadingIndicator } from './components/LoadingIndicator';
import { ErrorMessage } from './components/ErrorMessage';
import { isToday, isUpcoming } from './utils/date';

const SAMPLE_COMMANDS = [
  'Remind me to call John tomorrow at 5 PM',
  'Submit weekly report on Friday at 4 PM',
  'Doctor appointment on Monday at 10:30 AM',
  'Buy groceries tonight at 7 PM',
  'Prepare team presentation for tomorrow morning',
];

export default function App() {
  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Speech & AI state
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [manualCommandInput, setManualCommandInput] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [previewData, setPreviewData] = useState<ExtractedTaskData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Speech recognizer instance
  const speechRecognizer = useMemo(() => new WebSpeechRecognizer(), []);

  // Load initial tasks from local storage
  const loadTasks = useCallback(() => {
    try {
      const stored = storage.getTasks();
      setTasks(stored);
    } catch (e: any) {
      setErrorMessage('Failed to load local tasks');
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Setup speech callbacks
  useEffect(() => {
    speechRecognizer.setCallbacks(
      (text: string) => {
        setRecognizedText(text);
      },
      (error: string) => {
        setErrorMessage(error);
        setIsListening(false);
      },
      (listening: boolean) => {
        setIsListening(listening);
      }
    );

    return () => {
      speechRecognizer.stop();
    };
  }, [speechRecognizer]);

  // Handle Speech Toggle
  const handleVoiceToggle = () => {
    setErrorMessage(null);
    if (isListening) {
      speechRecognizer.stop();
      if (recognizedText.trim().length > 0) {
        processTaskCommand(recognizedText);
      }
    } else {
      setRecognizedText('');
      speechRecognizer.start();
    }
  };

  // Process natural voice or typed command through AI endpoint
  const processTaskCommand = async (command: string) => {
    if (!command || !command.trim()) {
      setErrorMessage('Please provide a command or speak into the microphone.');
      return;
    }

    setIsLoadingAi(true);
    setErrorMessage(null);

    try {
      const extracted = await api.extractTask(command.trim());
      setPreviewData(extracted);
      setIsPreviewOpen(true);
      setManualCommandInput('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to extract task with Gemini AI. Please try again.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Save AI extracted task
  const handleSaveExtractedTask = (finalData: ExtractedTaskData) => {
    setIsSaving(true);
    try {
      storage.saveTask(finalData);
      loadTasks();
      setIsPreviewOpen(false);
      setPreviewData(null);
      setRecognizedText('');
    } catch (err: any) {
      setErrorMessage('Failed to save task.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save manual task
  const handleSaveManualTask = (data: ExtractedTaskData) => {
    try {
      storage.saveTask(data);
      loadTasks();
      setIsAddModalOpen(false);
    } catch (err: any) {
      setErrorMessage('Failed to save task.');
    }
  };

  // Toggle completion
  const handleToggleComplete = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    storage.updateTask(id, { completed: !task.completed });
    loadTasks();
    if (selectedTask && selectedTask.id === id) {
      setSelectedTask({ ...selectedTask, completed: !task.completed });
    }
  };

  // Update task
  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    const updated = storage.updateTask(id, updates);
    loadTasks();
    if (updated && selectedTask && selectedTask.id === id) {
      setSelectedTask(updated);
    }
  };

  // Delete task
  const handleDeleteTask = (id: string) => {
    storage.deleteTask(id);
    loadTasks();
    if (selectedTask && selectedTask.id === id) {
      setIsDetailsOpen(false);
      setSelectedTask(null);
    }
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search text filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = task.task.toLowerCase().includes(query);
        const matchesDate = task.date && task.date.includes(query);
        if (!matchesName && !matchesDate) return false;
      }

      // Category filter
      if (activeFilter === 'today') return isToday(task.date);
      if (activeFilter === 'upcoming') return isUpcoming(task.date);
      if (activeFilter === 'completed') return task.completed;
      return true; // 'all'
    });
  }, [tasks, activeFilter, searchQuery]);

  const todayTasks = filteredTasks.filter((t) => isToday(t.date) && !t.completed);
  const upcomingTasks = filteredTasks.filter(
    (t) => (isUpcoming(t.date) || (!t.date && !t.completed)) && !isToday(t.date)
  );
  const completedTasks = filteredTasks.filter((t) => t.completed);

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex justify-center py-4 sm:py-8 px-2 sm:px-4">
      {/* Mobile-Framed App Container */}
      <div className="w-full max-w-lg bg-white sm:rounded-3xl shadow-xl border border-slate-200/80 flex flex-col overflow-hidden min-h-[92vh]">
        {/* Top App Header */}
        <header className="px-5 py-4 border-b border-slate-100 bg-white sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                  VoiceTask AI
                </h1>
                <p className="text-[11px] font-medium text-slate-500">Natural Speech to Tasks</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </span>
              <button
                id="header-add-task-btn"
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                Add Task
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className="flex-1 px-5 py-4 overflow-y-auto space-y-5">
          {/* Error Alert */}
          <ErrorMessage
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
            onRetry={recognizedText ? () => processTaskCommand(recognizedText) : undefined}
          />

          {/* Voice Input Action Card */}
          <section className="p-5 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200/90 shadow-xs text-center relative overflow-hidden">
            <VoiceButton
              isListening={isListening}
              onToggle={handleVoiceToggle}
              disabled={isLoadingAi || isSaving}
            />

            {/* Recognized Voice Transcript */}
            {recognizedText && (
              <div className="mt-3 p-3.5 bg-white border border-blue-200 rounded-xl text-left shadow-xs animate-in fade-in">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mb-1">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Recognized Speech:</span>
                </div>
                <p className="text-sm font-medium text-slate-800 italic">"{recognizedText}"</p>

                {!isListening && !isLoadingAi && (
                  <button
                    id="reprocess-speech-btn"
                    type="button"
                    onClick={() => processTaskCommand(recognizedText)}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    Extract Task with AI
                  </button>
                )}
              </div>
            )}

            {/* Natural Text Input / Quick Prompt */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                processTaskCommand(manualCommandInput);
              }}
              className="mt-4 flex items-center gap-1.5"
            >
              <input
                id="voice-command-text-input"
                type="text"
                value={manualCommandInput}
                onChange={(e) => setManualCommandInput(e.target.value)}
                placeholder="Or type voice command (e.g. 'Call John tomorrow at 5 PM')..."
                className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
              <button
                id="submit-typed-voice-command-btn"
                type="submit"
                disabled={isLoadingAi || !manualCommandInput.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer shrink-0 shadow-2xs"
                title="Extract task with AI"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Test Voice Command Pills */}
            <div className="mt-4 text-left">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Quick Sample Commands
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_COMMANDS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setRecognizedText(sample);
                      processTaskCommand(sample);
                    }}
                    className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200/80 rounded-lg transition-colors text-left cursor-pointer"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Dynamic Loading States */}
          {isLoadingAi && <LoadingIndicator message="Extracting task with Gemini..." isAi />}
          {isSaving && <LoadingIndicator message="Saving task to storage..." />}

          {/* Filter and Search Bar */}
          <div className="space-y-3 pt-1">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-tasks-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks or dates..."
                className="w-full pl-9.5 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(
                [
                  { id: 'all', label: 'All Tasks' },
                  { id: 'today', label: "Today's" },
                  { id: 'upcoming', label: 'Upcoming' },
                  { id: 'completed', label: 'Completed' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  id={`filter-tab-${tab.id}`}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeFilter === tab.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Task Lists Section */}
          <section className="space-y-4 pt-1">
            {/* Today's Tasks */}
            {(activeFilter === 'all' || activeFilter === 'today') && todayTasks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-bold text-slate-900">Today's Tasks</h2>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold">
                    {todayTasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {todayTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onDelete={handleDeleteTask}
                      onSelect={(t) => {
                        setSelectedTask(t);
                        setIsDetailsOpen(true);
                      }}
                      onEdit={(t) => {
                        setSelectedTask(t);
                        setIsDetailsOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming / Other Tasks */}
            {(activeFilter === 'all' || activeFilter === 'upcoming') && upcomingTasks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-bold text-slate-900">Upcoming & General Tasks</h2>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold">
                    {upcomingTasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {upcomingTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onDelete={handleDeleteTask}
                      onSelect={(t) => {
                        setSelectedTask(t);
                        setIsDetailsOpen(true);
                      }}
                      onEdit={(t) => {
                        setSelectedTask(t);
                        setIsDetailsOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {(activeFilter === 'all' || activeFilter === 'completed') && completedTasks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-sm font-bold text-slate-900">Completed Tasks</h2>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold">
                    {completedTasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onDelete={handleDeleteTask}
                      onSelect={(t) => {
                        setSelectedTask(t);
                        setIsDetailsOpen(true);
                      }}
                      onEdit={(t) => {
                        setSelectedTask(t);
                        setIsDetailsOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredTasks.length === 0 && <EmptyState />}
          </section>
        </main>

        {/* Bottom Floating Bar */}
        <footer className="p-4 border-t border-slate-100 bg-slate-50/90 flex items-center justify-end text-xs text-slate-500">
          <button
            id="mobile-bottom-add-btn"
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            New Task
          </button>
        </footer>
      </div>

      {/* Modals */}
      <TaskPreviewModal
        isOpen={isPreviewOpen}
        data={previewData}
        onSave={handleSaveExtractedTask}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewData(null);
        }}
      />

      <AddTaskModal
        isOpen={isAddModalOpen}
        onSave={handleSaveManualTask}
        onClose={() => setIsAddModalOpen(false)}
      />

      <TaskDetailsModal
        task={selectedTask}
        isOpen={isDetailsOpen}
        onToggleComplete={handleToggleComplete}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedTask(null);
        }}
      />
    </div>
  );
}
