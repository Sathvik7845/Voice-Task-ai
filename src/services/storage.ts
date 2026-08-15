import { Task } from '../types';

const STORAGE_KEY = 'voicetask_ai_tasks_v1';

export const storage = {
  getTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed: Task[] = JSON.parse(data);
      return parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      console.error('Error reading from localStorage', e);
      return [];
    }
  },

  saveTask(taskData: { task: string; date: string | null; time: string | null }): Task {
    const existing = this.getTasks();
    const newTask: Task = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      task: taskData.task.trim(),
      date: taskData.date,
      time: taskData.time,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTask, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newTask;
  },

  updateTask(id: string, updates: Partial<Task>): Task | null {
    const existing = this.getTasks();
    const index = existing.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const updatedTask: Task = {
      ...existing[index],
      ...updates,
    };
    existing[index] = updatedTask;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return updatedTask;
  },

  deleteTask(id: string): boolean {
    const existing = this.getTasks();
    const filtered = existing.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
