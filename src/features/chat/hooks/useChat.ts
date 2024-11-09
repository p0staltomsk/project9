import { useState, useCallback } from 'react'
import { Message, Metrics } from '../types'
import { SYSTEM_INSTRUCTION, PREPARED_RESPONSES } from '../model/constants'

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

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return

    // Добавляем сообщение пользователя
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage
    }])

    addTemporaryResponse()

    try {
      const context = prepareContext(userMessage)

      const response = await fetch('https://web.89281112.xyz/project9/api/neo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: context
        })
      })

      const data = await response.json()

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
      console.error('Chat error:', error)
      setNotification('Neural interface malfunction. Please try again.')
      setMessages(prev => prev.filter(msg => !msg.isTemporary))
    }
  }, [messages, isFirstMessage])

  const clearNotification = useCallback(() => {
    setNotification('')
  }, [])

  const setSystemError = useCallback((error: string) => {
    setNotification(`SYSTEM ERROR: ${error}`)
  }, [])

  return {
    messages,
    notification,
    sendMessage,
    clearNotification,
    setSystemError
  }
}
