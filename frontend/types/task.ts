export interface Task {
  id: string;
  task: string;
  date: string | null;
  time: string | null;
  completed: boolean;
  createdAt: string;
}

export interface ExtractedTaskData {
  task: string;
  date: string | null;
  time: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type TaskFilter = 'all' | 'today' | 'upcoming' | 'completed';
