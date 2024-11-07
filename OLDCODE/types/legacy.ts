export interface LegacyMessage {
  role: string;
  content: string;
  timestamp?: number;
  // другие устаревшие поля
}

export interface LegacyState {
  messages: LegacyMessage[];
  // другие устаревшие поля
} 