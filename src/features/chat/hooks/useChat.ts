import { useState, useCallback } from 'react'
import { Message } from '../types'
import { SYSTEM_INSTRUCTION } from '../model/constants'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Welcome to the Neon Nexus. How can I assist you in this digital realm?' }
  ])
  const [notification, setNotification] = useState<string | null>(null)

  const setSystemError = useCallback((error: string) => {
    setNotification(`CRITICAL ERROR: ${error}`)
  }, [])

  const sendMessage = useCallback(async (userInput: string, aiResponse: string, isTemporary = false) => {
    try {
      if (userInput) {
        setMessages(prev => [...prev, { role: 'user', content: userInput }])
      }

      if (aiResponse) {
        const message = {
          role: 'assistant' as const,
          content: aiResponse,
          isTemporary
        }
        setMessages(prev => [...prev, message])
      }
    } catch (error) {
      console.error('Error in sendMessage:', error)
      setSystemError('Neural network connection failed')
    }
  }, [setSystemError])

  const clearNotification = useCallback(() => {
    setNotification(null)
  }, [])

  return {
    messages,
    notification,
    sendMessage,
    setSystemError,
    clearNotification
  }
} 