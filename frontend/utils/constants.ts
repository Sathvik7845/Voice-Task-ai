export const STORAGE_KEYS = {
  TASKS: '@voicetask_ai_tasks_v1',
};

export const API_ENDPOINTS = {
  EXTRACT_TASK: '/tasks/extract',
  HEALTH: '/health',
};

export const DEFAULT_API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export const SAMPLE_VOICE_COMMANDS = [
  'Remind me to call John tomorrow at 5 PM',
  'Remind me to submit my assignment next Monday at 10 AM',
  'Buy groceries today',
  'Doctor appointment on Friday at 3:30 PM',
  'Team standup meeting tomorrow morning at 9:30 AM',
  'Call mom',
];
