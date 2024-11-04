# Neo API Metrics Analysis Guide

## Overview
This document describes the metrics returned by Neo API's content analysis system and how to interpret them for content verification.

## Response Structure

```typescript
interface NeoAPIMetricsResponse {
  analysis_id: string;
  text_id: string;
  is_ai_generated: boolean;
  threshold: number;
  human_likeness_score: number;
  metrics: ContentMetrics;
  elapsed_time: string;
}
```

## Core Metrics Categories

### 1. Text Coherence & Complexity
```typescript
interface TextCoherenceComplexity {
  sentence_coherence: number;     // Range: 0-1, Higher = More coherent
  complexity_score: number;       // Range: -1 to 1
  burstiness: number;            // Range: 0-1, Higher = More varied
  perplexity: number;            // Higher = More unpredictable
}
```

### 2. Readability Metrics
```typescript
interface ReadabilityMetrics {
  flesch_score: number;          // Range: 0-1, Higher = More readable
  gunning_fog_score: number;     // Lower = More accessible
  smog_score: number;            // Educational grade level
  avg_words_per_sentence: number;
}
```

### 3. Vocabulary & Lexical Diversity
```typescript
interface VocabularyLexicalDiversity {
  unique_word_ratio: number;     // Range: 0-1
  lexical_diversity: number;     // Range: 0-1
  rare_word_ratio: number;       // Range: 0-1
  key_term_significance: number; // Range: 0-1
}
```

## Interpretation Guide

### Human vs AI Detection Thresholds

| Metric | Human Range | AI Range | Warning Signs |
|--------|------------|----------|---------------|
| human_likeness_score | > 70 | < 50 | Score < 33 |
| sentence_coherence | 0.4-0.8 | > 0.9 | Perfect 1.0 |
| perplexity | > 10 | < 5 | Very low (< 3) |
| unique_word_ratio | 0.3-0.7 | < 0.2 | Extremely low/high |

### Red Flags for AI Content

1. **Perfect Scores**
   - sentence_coherence = 1.0
   - text_similarity = 1.0
   - repetition_rate = 1.0

2. **Statistical Anomalies**
   ```typescript
   const isStatisticallyAnomalous = (metrics: ContentMetrics): boolean => {
     return (
       metrics.text_coherence_complexity.perplexity < 3 ||
       metrics.vocabulary_lexical_diversity.unique_word_ratio < 0.1 ||
       metrics.readability_metrics.flesch_score > 0.95
     );
   };
   ```

3. **Entity Distribution**
   - Unnaturally even distribution
   - High concentration of specific entity types

## Usage Example

```typescript
function analyzeMetrics(response: NeoAPIMetricsResponse): ContentAnalysis {
  const {
    human_likeness_score,
    metrics: {
      text_coherence_complexity,
      vocabulary_lexical_diversity,
      statistical_metrics
    }
  } = response;

  const redFlags = [];

  // Check for perfect scores
  if (text_coherence_complexity.sentence_coherence === 1.0) {
    redFlags.push('Perfect coherence detected');
  }

  // Check vocabulary diversity
  if (vocabulary_lexical_diversity.unique_word_ratio < 0.1) {
    redFlags.push('Extremely low vocabulary diversity');
  }

  // Check statistical patterns
  if (statistical_metrics.repetition_rate > 0.9) {
    redFlags.push('High repetition pattern detected');
  }

  return {
    isLikelyAI: human_likeness_score < 50,
    confidence: calculateConfidence(redFlags.length),
    warnings: redFlags
  };
}
```

## Metric Combinations

### High Confidence AI Detection
```typescript
const isHighConfidenceAI = (metrics: ContentMetrics): boolean => {
  const {
    text_coherence_complexity: tcc,
    vocabulary_lexical_diversity: vld,
    statistical_metrics: sm
  } = metrics;

  return (
    tcc.perplexity < 5 &&
    vld.unique_word_ratio < 0.2 &&
    sm.repetition_rate > 0.8
  );
};
```

### Natural Human Patterns
```typescript
const hasNaturalHumanPatterns = (metrics: ContentMetrics): boolean => {
  const {
    text_coherence_complexity: tcc,
    readability_metrics: rm,
    vocabulary_lexical_diversity: vld
  } = metrics;

  return (
    tcc.perplexity > 10 &&
    rm.flesch_score < 0.9 &&
    vld.unique_word_ratio > 0.3
  );
};
```

## Future Improvements

1. **Adaptive Thresholds**
   - Context-aware scoring
   - Domain-specific benchmarks
   - Language-specific adjustments

2. **Enhanced Pattern Recognition**
   - Deep learning model integration
   - Temporal pattern analysis
   - Cross-reference verification

3. **Real-time Analysis**
   - Streaming metrics analysis
   - Progressive confidence scoring
   - Dynamic threshold adjustment

---

For implementation details, see [NEO_API_INTEGRATION.md](./NEO_API_INTEGRATION.md) 