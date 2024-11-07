export interface WindowSize {
  width: number;
  height: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  notification: string | null;
} 