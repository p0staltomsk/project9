import { useState, useCallback, useRef, useEffect } from 'react'
import { Message, Metrics } from '../types'
import { SYSTEM_INSTRUCTION, PREPARED_RESPONSES } from '../model/constants'

interface RateLimitError {
  error: {
    message: string;
    type: 'tokens';
    code: 'rate_limit_exceeded';
  }
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '0',
    role: 'assistant',
    content: "Welcome to the Neon Nexus. How can I assist you in this digital realm?",
    metrics: {
      is_ai_generated: true,
      human_likeness_score: 95,
      metrics: {
        text_coherence_complexity: {
          sentence_coherence: 0.9,
          complexity_score: 0.7,
          perplexity: 0.3,
          burstiness: 0.5
        },
        readability_metrics: {
          flesch_score: 75,
          avg_words_per_sentence: 15,
          gunning_fog_score: 8,
          smog_score: 7
        },
        vocabulary_lexical_diversity: {
          unique_word_ratio: 0.8,
          lexical_diversity: 0.7,
          rare_word_ratio: 0.2,
          key_term_significance: 0.85
        }
      }
    }
  }])
  const [notification, setNotification] = useState<string>('')
  const [isFirstMessage, setIsFirstMessage] = useState(true)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const cooldownTimer = useRef<NodeJS.Timeout | null>(null)
  const sendMessageRef = useRef<((message: string) => Promise<void>) | null>(null)

  // Подготовка контекста для API
  const prepareContext = (userMessage: string) => {
    const context = [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      ...messages
        .filter(msg => !msg.isTemporary)
        .map(msg => ({
          role: msg.role,
          content: msg.content.trim()
        })),
      { role: 'user', content: userMessage }
    ]

    if (isFirstMessage) {
      setIsFirstMessage(false)
    }

    return context
  }

  // Добавление временного ответа
  const addTemporaryResponse = () => {
    const tempResponse = PREPARED_RESPONSES[Math.floor(Math.random() * PREPARED_RESPONSES.length)]
    setMessages(prev => [...prev, {
      id: `temp-${Date.now()}`,
      role: 'assistant',
      content: tempResponse,
      isTemporary: true
    }])
  }

  // Парсинг времени ожидания из сообщения об ошибке
  const parseWaitTime = (errorMessage: string): number => {
    const match = errorMessage.match(/try again in (\d+\.?\d*)s/)
    return match ? Math.ceil(parseFloat(match[1])) : 5 // дефолтное значение 5 секунд
  }

  // Обработка rate limit теперь использует ref
  const handleRateLimit = useCallback((error: RateLimitError, failedMessage: string) => {
    const waitTime = parseWaitTime(error.error.message)
    setIsRateLimited(true)
    setCooldownTime(waitTime)
    setPendingMessage(failedMessage)

    setMessages(prev => [...prev, {
      id: `system-${Date.now()}`,
      role: 'system',
      content: `Neural network cooling down. Estimated wait time: ${waitTime} seconds. Message will be retried automatically.`,
      isTemporary: true
    }])

    if (cooldownTimer.current) {
      clearInterval(cooldownTimer.current)
    }

    cooldownTimer.current = setInterval(() => {
      setCooldownTime(prev => {
        if (prev <= 1) {
          clearInterval(cooldownTimer.current!)
          setIsRateLimited(false)

          // Используем ref для отправки
          const messageToRetry = failedMessage
          setTimeout(() => {
            setMessages(prev => prev.filter(msg => !msg.isTemporary))
            if (messageToRetry && sendMessageRef.current) {
              sendMessageRef.current(messageToRetry)
            }
          }, 100)

          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isRateLimited) return

    // Добавляем сообщение пользователя
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage
    }])

    addTemporaryResponse()

    try {
      const context = prepareContext(userMessage)

      const response = await fetch('/project9/api/neo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: context
        })
      }).catch(error => {
        // Перехватываем сетевые ошибки до того, как они попадут в консоль
        return { ok: false, status: 500, json: async () => ({ error: error.message }) }
      })

      const data = await response.json().catch(() => ({ error: 'Failed to parse response' }))

      // Проверяем все возможные случаи rate limit
      if (
        response.status === 429 ||
        response.status === 500 || // Добавляем проверку 500 ошибок
        data.error?.includes('Rate limit') ||
        data.error?.includes('rate_limit_exceeded')
      ) {
        // Извлекаем время ожидания из сообщения об ошибке
        const waitTimeMatch = data.error?.match(/try again in (\d+\.?\d*)s/)
        const waitTime = waitTimeMatch ? Math.ceil(parseFloat(waitTimeMatch[1])) : 5

        // Создаем структурированную ошибку rate limit
        const rateLimitInfo: RateLimitError = {
          error: {
            message: data.error || `Rate limit exceeded. Please wait ${waitTime} seconds.`,
            type: 'tokens' as const,
            code: 'rate_limit_exceeded' as const
          }
        }

        handleRateLimit(rateLimitInfo, userMessage)
        return
      }

      // Остальные ошибки
      if (!response.ok) {
        throw new Error(data.error || 'Unknown error occurred')
      }

      // Успешный ответ
      if (data.status === 'success' && data.message) {
        // Проверяем и нормализуем метрики из ответа
        const metrics: Metrics = {
          is_ai_generated: data.metrics?.is_ai_generated ?? true,
          human_likeness_score: data.metrics?.human_likeness_score ?? 0,
          metrics: {
            text_coherence_complexity: {
              sentence_coherence: data.metrics?.metrics?.text_coherence_complexity?.sentence_coherence ?? 0,
              complexity_score: data.metrics?.metrics?.text_coherence_complexity?.complexity_score ?? 0,
              perplexity: data.metrics?.metrics?.text_coherence_complexity?.perplexity ?? 0,
              burstiness: data.metrics?.metrics?.text_coherence_complexity?.burstiness ?? 0
            },
            readability_metrics: {
              flesch_score: data.metrics?.metrics?.readability_metrics?.flesch_score ?? 0,
              avg_words_per_sentence: data.metrics?.metrics?.readability_metrics?.avg_words_per_sentence ?? 0,
              gunning_fog_score: data.metrics?.metrics?.readability_metrics?.gunning_fog_score ?? 0,
              smog_score: data.metrics?.metrics?.readability_metrics?.smog_score ?? 0
            },
            vocabulary_lexical_diversity: {
              unique_word_ratio: data.metrics?.metrics?.vocabulary_lexical_diversity?.unique_word_ratio ?? 0,
              lexical_diversity: data.metrics?.metrics?.vocabulary_lexical_diversity?.lexical_diversity ?? 0,
              rare_word_ratio: data.metrics?.metrics?.vocabulary_lexical_diversity?.rare_word_ratio ?? 0,
              key_term_significance: data.metrics?.metrics?.vocabulary_lexical_diversity?.key_term_significance ?? 0
            },
            sentiment_subjectivity: {
              sentiment_score: data.metrics?.metrics?.sentiment_subjectivity?.sentiment_score ?? 0,
              sentiment_label: data.metrics?.metrics?.sentiment_subjectivity?.sentiment_label ?? 'neutral',
              subjectivity_score: data.metrics?.metrics?.sentiment_subjectivity?.subjectivity_score ?? 0,
              text_similarity: data.metrics?.metrics?.sentiment_subjectivity?.text_similarity ?? 0
            },
            stylistic_features: {
              formality: data.metrics?.metrics?.stylistic_features?.formality ?? 0,
              passive_voice_ratio: data.metrics?.metrics?.stylistic_features?.passive_voice_ratio ?? 0
            },
            structural_analysis: {
              noun_percentage: data.metrics?.metrics?.structural_analysis?.noun_percentage ?? 0,
              verb_percentage: data.metrics?.metrics?.structural_analysis?.verb_percentage ?? 0,
              adjective_percentage: data.metrics?.metrics?.structural_analysis?.adjective_percentage ?? 0,
              adverb_percentage: data.metrics?.metrics?.structural_analysis?.adverb_percentage ?? 0,
              entity_count: data.metrics?.metrics?.structural_analysis?.entity_count ?? 0,
              entity_type_distribution: data.metrics?.metrics?.structural_analysis?.entity_type_distribution ?? {}
            }
          }
        }

        setMessages(prev => [
          ...prev.filter(msg => !msg.isTemporary),
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.message.trim(),
            metrics
          }
        ])
      } else {
        throw new Error(data.error || 'Unknown error occurred')
      }
    } catch (error) {
      // Тихая обработка ошибок, связанных с rate limit
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()
        if (
          errorMessage.includes('rate limit') ||
          errorMessage.includes('429') ||
          errorMessage.includes('500')
        ) {
          const rateLimitInfo: RateLimitError = {
            error: {
              message: error.message,
              type: 'tokens' as const,
              code: 'rate_limit_exceeded' as const
            }
          }
          handleRateLimit(rateLimitInfo, userMessage)
          return
        }
      }

      // Для других ошибок показываем уведомление
      setNotification('Neural interface malfunction. Please try again.')
      setMessages(prev => prev.filter(msg => !msg.isTemporary))
    }
  }, [messages, isFirstMessage, isRateLimited, handleRateLimit])

  const clearNotification = useCallback(() => {
    setNotification('')
  }, [])

  const setSystemError = useCallback((error: string) => {
    console.error(error)
    // Только для критических ошибок API
    if (error.includes('API') || error.includes('Network')) {
      setNotification(error)
    }
  }, [])

  // Сохраняем текущую функцию отправки в ref
  useEffect(() => {
    sendMessageRef.current = sendMessage
  }, [sendMessage])

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (cooldownTimer.current) {
        clearInterval(cooldownTimer.current)
      }
    }
  }, [])

  return {
    messages,
    notification,
    sendMessage,
    clearNotification,
    setSystemError,
    isRateLimited,
    cooldownTime,
    pendingMessage
  }
}
