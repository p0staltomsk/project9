# Neo API Integration Guide

## Overview
The system uses a dual-API approach with Neo API as the primary content analyzer and a fallback mechanism for content humanization.

## Architecture

### 1. Neo API Integration

```typescript
interface NeoAPIResponse {
  analysis_id: string;
  is_ai_generated: boolean;
  v2_score: number;
  metrics?: {
    coherence_score: number;
    entropy_score: number;
    burstiness_score: number;
    perplexity_score: number;
    vocab_richness_score: number;
    readability_score: number;
    dominant_prob_score: number;
  };
}
```

### 2. Fallback System

The fallback system uses a sophisticated prompt engineering approach for content humanization:

```python
FALLBACK_PROMPT = """
You are an advanced text humanization AI. Transform input text to mimic natural human writing while preserving the original meaning and intent. Follow these guidelines:
1. Analyze: Quickly assess the text's style, tone, and content.
2. Adapt: Maintain consistent overall tone and style with the original.
3. Humanize: Ensure the output resembles natural human writing by:
   - Varying sentence structure and length
   - Using contractions, idioms, and colloquialisms appropriately
   - Incorporating subtle imperfections
   - Balancing formality and informality based on context
4. Preserve: Maintain the original message's core meaning and intent.
"""
```

## Implementation Flow

1. **Initial Analysis**
```typescript
async function analyzeContent(text: string): Promise<NeoAPIResponse> {
  const response = await neoApi.detect({
    text,
    full_metrics: true
  });
  return response;
}
```

2. **Metric-Based Prompt Generation**
```typescript
interface MetricInstructions {
  [key: string]: [string, string, boolean];
}

const metricInstructions: MetricInstructions = {
  coherence_score: ["Adjust coherence", "Maintain logical flow", false],
  entropy_score: ["Adjust entropy", "Balance vocabulary diversity", true],
  burstiness_score: ["Enhance burstiness", "Alternate detail levels", true],
  perplexity_score: ["Adjust perplexity", "Include contextual elements", true],
  vocab_richness_score: ["Maintain natural vocabulary", "Balance terms", false],
  readability_score: ["Adjust readability", "Balance complexity", true],
  dominant_prob_score: ["Reduce dominant probability", "Vary expressions", false]
};
```

3. **Dynamic System Prompt Generation**
```typescript
function generateDynamicPrompt(metrics: Record<string, number>): string {
  const avgScore = Object.values(metrics).reduce((a, b) => a + b) / Object.keys(metrics).length;
  const threshold = avgScore * 0.1;
  
  const instructions = Object.entries(metricInstructions)
    .filter(([metric, [_, __, isHighGood]]) => {
      const score = metrics[metric];
      return isHighGood ? 
        score < avgScore - threshold :
        score > avgScore + threshold;
    })
    .map(([_, [action, description]]) => `- ${action}: ${description}`);

  return FALLBACK_PROMPT.replace(
    "{{special_instructions}}", 
    instructions.length ? 
      "Based on analysis, focus on:\n" + instructions.join("\n") : 
      ""
  );
}
```

## Usage Example

```typescript
async function processMessage(text: string): Promise<string> {
  try {
    // Try Neo API first
    const analysis = await analyzeContent(text);
    
    if (analysis.is_ai_generated) {
      // Generate dynamic prompt based on metrics
      const prompt = generateDynamicPrompt(analysis.metrics);
      
      // Use fallback system
      return await humanizeContent(text, prompt);
    }
    
    return text; // Text is likely human-generated
  } catch (error) {
    console.error('Neo API Error:', error);
    // Use default fallback
    return await humanizeContent(text, FALLBACK_PROMPT);
  }
}
```

## Metrics Guide

| Metric | Description | Target Range |
|--------|-------------|--------------|
| coherence_score | Text flow and logical connections | 0.6 - 0.8 |
| entropy_score | Information density and unpredictability | 0.4 - 0.7 |
| burstiness_score | Variation in information density | 0.3 - 0.6 |
| perplexity_score | Text predictability | 0.4 - 0.7 |
| vocab_richness_score | Vocabulary diversity | 0.5 - 0.8 |
| readability_score | Text complexity balance | 0.4 - 0.7 |
| dominant_prob_score | Pattern repetition | 0.3 - 0.5 |

## Error Handling

```typescript
interface ErrorResponse {
  error: string;
  details?: string;
}

function handleApiError(error: unknown): ErrorResponse {
  return {
    error: 'Processing error',
    details: error instanceof Error ? error.message : 'Unknown error'
  };
}
```

## Future Improvements

1. Implement adaptive thresholds based on content type
2. Add support for multi-language analysis
3. Develop custom metric weightings
4. Create content-specific prompt templates
5. Implement real-time metric visualization

---
For more details, see the [API Documentation](./API.md) and [Metrics Guide](./METRICS.md). 