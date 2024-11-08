export interface WindowSize {
  width: number;
  height: number;
}

export interface Message {
  content: string;
  role: 'user' | 'assistant' | 'system';
  isTemporary?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  notification: string | null;
} 