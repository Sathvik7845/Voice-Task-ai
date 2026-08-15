import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/task';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Service to manage persistent local storage of tasks using AsyncStorage
 */
export const storageService = {
  /**
   * Retrieves all tasks stored locally
   */
  async getTasks(): Promise<Task[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      if (!jsonValue) return [];
      const parsed: Task[] = JSON.parse(jsonValue);
      // Sort tasks by date (newest first or upcoming first)
      return parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('[StorageService] Error loading tasks:', error);
      return [];
    }
  },

  /**
   * Saves a new task into local storage
   */
  async saveTask(taskData: { task: string; date: string | null; time: string | null }): Promise<Task> {
    try {
      const existingTasks = await this.getTasks();
      const newTask: Task = {
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
        task: taskData.task.trim(),
        date: taskData.date,
        time: taskData.time,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      const updatedTasks = [newTask, ...existingTasks];
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
      return newTask;
    } catch (error) {
      console.error('[StorageService] Error saving task:', error);
      throw new Error('Failed to save task to local storage');
    }
  },

  /**
   * Updates an existing task by ID
   */
  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      const existingTasks = await this.getTasks();
      const index = existingTasks.findIndex(t => t.id === id);
      if (index === -1) return null;

      const updatedTask: Task = {
        ...existingTasks[index],
        ...updates,
      };

      existingTasks[index] = updatedTask;
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(existingTasks));
      return updatedTask;
    } catch (error) {
      console.error('[StorageService] Error updating task:', error);
      throw new Error('Failed to update task in local storage');
    }
  },

  /**
   * Deletes a task by ID
   */
  async deleteTask(id: string): Promise<boolean> {
    try {
      const existingTasks = await this.getTasks();
      const filtered = existingTasks.filter(t => t.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('[StorageService] Error deleting task:', error);
      throw new Error('Failed to delete task from local storage');
    }
  },

  /**
   * Clears all tasks from storage
   */
  async clearTasks(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TASKS);
    } catch (error) {
      console.error('[StorageService] Error clearing tasks:', error);
      throw new Error('Failed to clear tasks from storage');
    }
  },
};
