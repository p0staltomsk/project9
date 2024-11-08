# Grog AI Integration Guide

## Overview
Grog AI предоставляет доступ к языковым моделям для генерации текста.

## Current Models

### Text Generation Models

#### LLaMA 3 Series
```typescript
interface LLaMA3Config {
  maxTokens: 8192;
  temperature?: number; // 0.0 - 1.0
  topP?: number;        // 0.0 - 1.0
}
```

1. **llama3-groq-70b-8192-tool-use-preview**
   - Контекст: 8192 токена
   - Оптимизирован для: Диалогов
   - Основная модель проекта

2. **llama3-groq-8b-8192-tool-use-preview**
   - Контекст: 8192 токена
   - Быстрая версия
   - Для тестирования

### Usage Example

```typescript
import { GrogAI } from '@grog/sdk';

const grog = new GrogAI({
  apiKey: process.env.GROG_API_KEY
});

// Text Generation
const response = await grog.complete({
  model: "llama3-groq-70b-8192-tool-use-preview",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Hello!" }
  ],
  temperature: 0.7,
  maxTokens: 8000
});
```

## Best Practices

1. **Token Management**
```typescript
const calculateTokens = (text: string): number => {
  return Math.ceil(text.length / 4); // Approximate
};
```

2. **Error Handling**
```typescript
try {
  const response = await grog.complete({
    model: "llama3-groq-70b-8192-tool-use-preview",
    // ...
  });
} catch (error) {
  if (error.code === 'CONTEXT_LENGTH_EXCEEDED') {
    // Handle context length error
  }
  // Handle other errors
}
```

3. **Rate Limiting**
```typescript
const rateLimiter = {
  requests: 0,
  resetTime: Date.now(),
  limit: 10,
  interval: 60000, // 1 minute
};
```

## Future Models (Roadmap)
- [ ] Vision Models
- [ ] Audio Models
- [ ] Enhanced LLaMA 4.0
- [ ] Multimodal Support

---
For API integration details, see [API.md](./API.md)
