src/
├── components/ # Переиспользуемые UI компоненты
│ ├── chat/
│ │ ├── ui/ # UI компоненты чата
│ │ │ ├── AIMetricsComponent.tsx # Компонент для отображения метрик анализа текста в неоновом киберпанк стиле
│ │ │ └── ...
│ │ ├── hooks/ # Хуки для управления чатом
│ │ ├── model/ # Константы и бизнес-логика
│ │ ├── types/ # Типы и интерфейсы
│ │ └── ui/ # UI компоненты чата
│ ├── console.tsx # Консольный режим чата
│ ├── CyberNotification # Системные уведомления
│ └── AnimatedBackground # Анимированный фон
├── features/
│ └── chat/
│ ├── hooks/ # Хуки для управления чатом
│ ├── model/ # Константы и бизнес-логика
│ ├── types/ # Типы и интерфейсы
│ └── ui/ # UI компоненты чата
├── pages/ # Страницы приложения
└── styles/ # Глобальные стили

### Основные компоненты
- `index.tsx` - Главный чат с неоновым интерфейсом
- `console.tsx` - Консольный режим чата
- `CyberNotification` - Системные уведомления
- `AnimatedBackground` - Анимированный фон

## Алгоритм работы чата

### 1. Управление контекстом

context: [
{ role: 'system', content: SYSTEM_INSTRUCTION }, // Всегда первым
{ role: 'assistant', content: "..." },
{ role: 'user', content: "..." },
{ role: 'assistant', content: "..." },
]

### 2. Процесс обработки сообщений
1. Пользователь отправляет сообщение
2. Добавляется временный ответ из PREPARED_RESPONSES
3. Формируется контекст с системной инструкцией
4. Отправляется запрос к API
5. Временный ответ заменяется на реальный

### 3. Обработка ошибок
- При ошибке сети сохраняется временный ответ
- Показывается уведомление об ошибке
- Автоматическая попытка восстановления

## Метрики и аналитика

### Основные метрики (Quick View)
- 🤖 AI Detection Score: {is_ai_generated + human_likeness_score}
- 📊 Text Quality: {sentence_coherence}
- 📚 Readability: {flesch_score}

### Расширенные метрики (Show Details)

#### 🧠 Когнитивный анализ
- Связность текста: {sentence_coherence}
- Сложность: {complexity_score}
- Непредсказуемость: {perplexity}
- Вариативность: {burstiness}

#### 📖 Читабельность
- Flesch Score: {flesch_score}
- Gunning Fog: {gunning_fog_score}
- SMOG Index: {smog_score}
- Слов в предложении: {avg_words_per_sentence}

#### 🎯 Лексический анализ
- Уникальные слова: {unique_word_ratio}
- Лексическое разнообразие: {lexical_diversity}
- Редкие слова: {rare_word_ratio}
- Значимость терминов: {key_term_significance}

#### 🎭 Стиль и эмоции
- Формальность: {formality}
- Пассивный залог: {passive_voice_ratio}
- Тональность: {sentiment_score}
- Субъективность: {subjectivity_score}

#### 📐 Структурный анализ
- Существительные: {noun_percentage}
- Глаголы: {verb_percentage}
- Прилагательные: {adjective_percentage}
- Наречия: {adverb_percentage}

### Визуализация
- Круговые диаграммы для процентных показателей
- Бары прогресса для скоров
- Радар-диаграмма для комплексных метрик
- Цветовая индикация (красный -> желтый -> зеленый)

### Интерактивность
- Hover для детальной информации
- Click для развернутого анализа
- Анимация при обновлении значений
- Сравнение с предыдущими сообщениями

## Оптимизация
- Дебаунс для ресайза окна
- Ленивая загрузка компонентов
- Оптимизированный рендеринг сообщений
- Кэширование контекста диалога

## Компоненты UI

### AIMetrics Component
Компонент для отображения метрик анализа текста в неоновом киберпанк стиле.

#### Основной функционал:
1. **Quick View (всегда видимые метрики)**
   - AI/Human Score:
     - 🤖 AI Score: (100 - human_likeness_score)% если human_likeness_score ≤ 50
     - 👤 Human-Like: human_likeness_score% если human_likeness_score > 50
   - 🧠 Coherence: показатель связности текста

2. **Detailed View (по клику "Show Details")**
   - 📖 Readability (читаемость)
     - Flesch Score
     - Words per Sentence
   - 🎯 Vocabulary (словарный запас)
     - Unique Words Ratio
     - Lexical Diversity
   - 💡 Sentiment (эмоциональная окраска)
     - Type (positive/negative/neutral)
     - Score (0-1)
   - 🎭 Style (стиль текста)
     - Formality
     - Complexity

#### Особенности реализации:
- Анимированное появление/скрытие деталей через Framer Motion
- Автоматическое форматирование значений:
  - Проценты: `formatPercent()` - одна цифра после запятой
  - Скоры: `formatScore()` - две цифры после запятой
- Адаптивная сетка для детальных метрик (grid-cols-2)
- Цветовое кодирование категорий:
  - cyan-400: AI/Human Score
  - purple-400: Coherence
  - green-400: Readability
  - blue-400: Vocabulary
  - orange-400: Sentiment
  - red-400: Style

#### Стилизация:
- Полупрозрачный фон (bg-black)
