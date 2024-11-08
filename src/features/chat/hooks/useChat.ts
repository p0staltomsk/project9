import { useState, useEffect, useCallback } from 'react'
import { Message, Metrics } from '../types'
import { SYSTEM_INSTRUCTION, PREPARED_RESPONSES } from '../model/constants'

const API_BASE_URL = 'https://web.89281112.xyz/project9/api/neo'
const WS_URL = 'wss://web.89281112.xyz/project9/ws'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '0',
    role: 'assistant',
    content: "Welcome to the Neon Nexus. How can I assist you in this digital realm?",
    metrics: {
      is_ai_generated: true,
      human_likeness_score: 85,
      metrics: {
        text_coherence_complexity: {
          sentence_coherence: 0.95,
          complexity_score: 0.7,
          perplexity: 0.3
        }
      }
    }
  }])
  const [notification, setNotification] = useState<string>('')

  // Обработка пустого ответа от GROQ
  const handleEmptyResponse = () => {
    const fallbackMessages = [
      "Neural interface disrupted. Recalibrating systems...",
      "Quantum fluctuation detected. Attempting to stabilize connection...",
      "Cybernetic synchronization temporarily offline. Please retry your query...",
      "Digital entropy detected. Realigning neural pathways..."
    ]
    const randomMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)]

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: randomMessage,
      metrics: {
        is_ai_generated: true,
        human_likeness_score: 100,
        metrics: {
          text_coherence_complexity: {
            sentence_coherence: 1.0,
            complexity_score: 0.8,
            perplexity: 0.2
          }
        }
      }
    }])
  }

  // Отправка сообщения
  const sendMessage = useCallback(async (userMessage: string, assistantMessage: string, isTemporary = false) => {
    if (userMessage) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'user',
        content: userMessage
      }])
    }

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      })

      const data = await response.json()

      if (!data.message || data.message.trim().length === 0) {
        handleEmptyResponse()
        return
      }

      const messageId = Date.now().toString()
      setMessages(prev => [...prev, {
        id: messageId,
        role: 'assistant',
        content: data.message,
        metrics: data.metrics,
        isTemporary
      }])
    } catch (error) {
      console.error('Chat error:', error)
      handleEmptyResponse()
    }
  }, [])

  // Очистка уведомления
  const clearNotification = useCallback(() => {
    setNotification('')
  }, [])

  // Установка системной ошибки
  const setSystemError = useCallback((error: string) => {
    setNotification(`SYSTEM ERROR: ${error}`)
  }, [])

  return {
    messages,
    notification,
    sendMessage,
    clearNotification,
    setSystemError,
    handleEmptyResponse
  }
}
