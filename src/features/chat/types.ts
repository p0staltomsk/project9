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
      burstiness?: number;
    };
    readability_metrics?: {
      flesch_score: number;
      avg_words_per_sentence: number;
      gunning_fog_score?: number;
      smog_score?: number;
    };
    vocabulary_lexical_diversity?: {
      unique_word_ratio: number;
      lexical_diversity: number;
      rare_word_ratio?: number;
      key_term_significance?: number;
    };
    sentiment_subjectivity?: {
      sentiment_score: number;
      sentiment_label: string;
      subjectivity_score: number;
      text_similarity: number;
    };
    stylistic_features?: {
      formality: number;
      passive_voice_ratio: number;
    };
    structural_analysis?: {
      noun_percentage: number;
      verb_percentage: number;
      adjective_percentage: number;
      adverb_percentage: number;
      entity_count: number;
      entity_type_distribution: Record<string, number>;
    };
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  isTemporary?: boolean;
  metrics?: {
    is_ai_generated?: boolean;
    human_likeness_score?: number;
    metrics?: {
      text_coherence_complexity?: {
        sentence_coherence: number;
        complexity_score: number;
        perplexity: number;
        burstiness?: number;
      };
      readability_metrics?: {
        flesch_score: number;
        avg_words_per_sentence: number;
        gunning_fog_score?: number;
        smog_score?: number;
      };
      vocabulary_lexical_diversity?: {
        unique_word_ratio: number;
        lexical_diversity: number;
        rare_word_ratio?: number;
        key_term_significance?: number;
      };
      sentiment_subjectivity?: {
        sentiment_score: number;
        sentiment_label: string;
        subjectivity_score: number;
        text_similarity: number;
      };
      stylistic_features?: {
        formality: number;
        passive_voice_ratio: number;
      };
      structural_analysis?: {
        noun_percentage: number;
        verb_percentage: number;
        adjective_percentage: number;
        adverb_percentage: number;
        entity_count: number;
        entity_type_distribution: Record<string, number>;
      };
    };
  };
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  notification: string | null;
}
