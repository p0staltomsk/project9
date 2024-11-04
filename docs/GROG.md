# Grog AI Models Documentation

## Overview
Grog AI предоставляет доступ к различным языковым моделям, оптимизированным для разных задач.

## Available Models

### Text Generation Models

#### LLaMA 3 Series
```typescript
interface LLaMA3Config {
  maxTokens: 8192 | 32768;
  temperature?: number; // 0.0 - 1.0
  topP?: number;        // 0.0 - 1.0
}
```

1. **llama3-groq-70b-8192-tool-use-preview**
   - Контекст: 8192 токена
   - Оптимизирован для: Использования инструментов
   - Рекомендуется для: Сложных задач с API интеграцией

2. **llama3-groq-8b-8192-tool-use-preview**
   - Контекст: 8192 токена
   - Быстрая версия для разработки
   - Хорошо подходит для тестирования

### Versatile Models

#### LLaMA 3.1 Series
```typescript
interface LLaMA31Config {
  model: "llama-3.1-70b-versatile" | "llama-3.1-8b-instant";
  options: {
    temperature: number;
    maxTokens: number;
    stream?: boolean;
  };
}
```

1. **llama-3.1-70b-versatile**
   - Универсальная модель
   - Высокое качество генерации
   - Поддержка различных задач

2. **llama-3.1-8b-instant**
   - Быстрые ответы
   - Оптимальна для чат-ботов
   - Низкая латентность

### Vision Models

#### LLaMA 3.2 Vision Series
```typescript
interface VisionModelConfig {
  model: "llama-3.2-11b-vision-preview" | "llama-3.2-90b-vision-preview";
  input: {
    text: string;
    images?: string[]; // Base64 encoded images
  };
}
```

1. **llama-3.2-11b-vision-preview**
   - Обработка изображений
   - Средний размер модели
   - Хорошее соотношение скорость/качество

2. **llama-3.2-90b-vision-preview**
   - Продвинутая обработка изображений
   - Высокая точность
   - Большой контекст

### Audio Models

#### Whisper Series
```typescript
interface WhisperConfig {
  model: "whisper-large-v3" | "whisper-large-v3-turbo" | "distil-whisper-large-v3-en";
  audio: {
    format: "wav" | "mp3";
    sampleRate: number;
  };
}
```

1. **whisper-large-v3**
   - Полная версия
   - Все языки
   - Высокая точность

2. **whisper-large-v3-turbo**
   - Оптимизирована для скорости
   - Реальное время
   - Потоковая обработка

### Usage Example

```typescript
import { GrogAI } from '@grog/sdk';

const grog = new GrogAI({
  apiKey: process.env.GROG_API_KEY
});

// Text Generation
const textResponse = await grog.complete({
  model: "llama3-groq-70b-8192-tool-use-preview",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Hello!" }
  ],
  temperature: 0.7,
  maxTokens: 8000
});

// Vision
const visionResponse = await grog.analyze({
  model: "llama-3.2-90b-vision-preview",
  input: {
    text: "Describe this image",
    images: ["base64_encoded_image"]
  }
});

// Audio
const audioResponse = await grog.transcribe({
  model: "whisper-large-v3",
  audio: {
    format: "wav",
    data: audioBuffer
  }
});
```

## Model Selection Guide

### For Chat Applications
1. **Fast Response**
   - llama-3.1-8b-instant
   - llama-3.2-3b-preview

2. **High Quality**
   - llama-3.1-70b-versatile
   - llama3-groq-70b-8192-tool-use-preview

### For Vision Tasks
1. **General Purpose**
   - llama-3.2-11b-vision-preview

2. **Advanced Analysis**
   - llama-3.2-90b-vision-preview

### For Audio Processing
1. **Real-time**
   - whisper-large-v3-turbo

2. **Accuracy**
   - whisper-large-v3

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

## Future Models
- Ожидается: llama-4.0
- В разработке: Enhanced vision models
- Планируется: Multimodal models

---
For API integration details, see [API.md](./API.md)
