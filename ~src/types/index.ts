import { ReactNode } from 'react';

// Базовые типы для чата
export interface Message {
  id: string;
  content: string;
}

// Типы для API
export interface APIResponse {
  id: string;
  message?: string;
  choices?: Array<{
    message: {
      content: string;
    };
  }>;
  /* Metrics temporarily disabled
  metrics?: Message['metrics'];
  error?: string;
  details?: string;
  */
}

// Типы для UI
export interface WindowSize {
  width: number;
  height: number;
}

// Типы для хуков
export interface ChatHookReturn {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
  /* Metrics temporarily disabled
  notification: string | null;
  systemError: string | null;
  clearNotification: () => void;
  setSystemError: (error: string | null) => void;
  */
}