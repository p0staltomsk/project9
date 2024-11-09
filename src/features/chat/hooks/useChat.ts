import { useState, useCallback } from 'react'
import { Message } from '../types'
import { SYSTEM_INSTRUCTION, PREPARED_RESPONSES } from '../model/constants'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '0',
    role: 'assistant',
    content: "Welcome to the Neon Nexus. How can I assist you in this digital realm?",
  }])
  const [notification, setNotification] = useState<string>('')
  const [isFirstMessage, setIsFirstMessage] = useState(true)

  // Подготовка контекста для API
  const prepareContext = (userMessage: string) => {
    const context = [
      ...(isFirstMessage ? [{ role: 'system', content: SYSTEM_INSTRUCTION }] : []),
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

    // Добавляем временный ответ
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
        // Удаляем временное сообщение и добавляем реальный ответ
        setMessages(prev => [
          ...prev.filter(msg => !msg.isTemporary),
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.message.trim(),
            metrics: data.metrics
          }
        ])
      } else {
        throw new Error(data.error || 'Unknown error occurred')
      }
    } catch (error) {
      console.error('Chat error:', error)
      setNotification('Neural interface malfunction. Please try again.')

      // Оставляем временное сообщение как fallback
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
