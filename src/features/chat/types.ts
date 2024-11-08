export interface WindowSize {
  width: number;
  height: number;
}

export interface Metrics {
  is_ai_generated: boolean;
  human_likeness_score: number;
  metrics?: {
    text_coherence_complexity?: {
      sentence_coherence: number;
      complexity_score: number;
      perplexity: number;
    };
    readability_metrics?: {
      flesch_score: number;
      avg_words_per_sentence: number;
    };
    vocabulary_lexical_diversity?: {
      unique_word_ratio: number;
      lexical_diversity: number;
    };
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isTemporary?: boolean;
  metrics?: Metrics;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  notification: string | null;
}
