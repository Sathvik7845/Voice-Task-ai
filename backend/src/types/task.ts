export interface ExtractedTaskData {
  task: string;
  date: string | null;
  time: string | null;
}

export interface ExtractTaskRequest {
  text: string;
  clientDate?: string;
  timeZone?: string;
}

export interface ExtractTaskResponse {
  success: boolean;
  data?: ExtractedTaskData;
  error?: string;
  message?: string;
}

export interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
}
