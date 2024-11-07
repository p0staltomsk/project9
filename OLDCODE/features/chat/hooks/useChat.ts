import { useState, useEffect } from 'react'
import { Message, ChatState } from '../model/types'
import { PREPARED_RESPONSES, SYSTEM_INSTRUCTION } from '../model/constants'
import { APIClient } from '../../../types/api'
import { migrateOldMessages, validateChatState } from '../lib/migrationUtils'

export const useChat = () => {
  const [state, setState] = useState<ChatState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedState = localStorage.getItem('chatState')
        if (savedState) {
          const parsedState = JSON.parse(savedState)
          const migratedMessages = migrateOldMessages(parsedState.messages || [])
          return {
            messages: migratedMessages,
            isLoading: false,
            notification: null
          }
        }
      } catch (error) {
        console.error('Failed to migrate old state:', error)
      }
    }
    
    return {
      messages: [{ 
        role: 'assistant', 
        content: 'Welcome to the Neon Nexus. How can I assist you in this digital realm?' 
      }],
      isLoading: false,
      notification: null
    }
  })

  useEffect(() => {
    if (!validateChatState(state)) {
      console.error('Invalid chat state detected')
      setState({
        messages: [{ 
          role: 'assistant', 
          content: 'System restore initiated. How may I assist you?' 
        }],
        isLoading: false,
        notification: 'SYSTEM RESTORE: Chat history has been reset'
      })
    }
  }, [state])

  const sendMessage = async (input: string, apiClient: APIClient) => {
    if (!input.trim() || state.isLoading) return

    setState(prev => ({ ...prev, isLoading: true }))
    const userMessage = { role: 'user', content: input } as Message

    try {
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage]
      }))

      const preparedResponse = {
        role: 'assistant',
        content: PREPARED_RESPONSES[Math.floor(Math.random() * PREPARED_RESPONSES.length)]
      } as Message

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, preparedResponse]
      }))

      const neoResponse = await apiClient.processWithNeo(input)
      
      if (!neoResponse.success) {
        const grogResponse = await apiClient.processWithGrog(
          [...state.messages, userMessage],
          SYSTEM_INSTRUCTION
        )

        const aiMessage = {
          role: 'assistant',
          content: grogResponse.choices[0].message.content
        } as Message

        setState(prev => ({
          ...prev,
          messages: [...prev.messages, aiMessage]
        }))
      } else {
        const aiMessage = {
          role: 'assistant',
          content: `Neo API: ${neoResponse.data}`
        } as Message

        setState(prev => ({
          ...prev,
          messages: [...prev.messages, aiMessage]
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        notification: 'CRITICAL ERROR: Neural network connection failed',
        messages: [...prev.messages, {
          role: 'assistant',
          content: 'A glitch in the Matrix. Please try your request again.'
        }]
      }))
      console.error('Error:', error)
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const clearNotification = () => {
    setState(prev => ({ ...prev, notification: null }))
  }

  const setSystemError = (errorMessage: string) => {
    setState(prev => ({
      ...prev,
      notification: errorMessage
    }))
  }

  return {
    ...state,
    sendMessage,
    clearNotification,
    setSystemError
  }
} 