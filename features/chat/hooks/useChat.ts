import { useState } from 'react'
import { Message, ChatState } from '../model/types'
import { PREPARED_RESPONSES, SYSTEM_INSTRUCTION } from '../model/constants'
import { NeoAPI } from '../../../types/neo-api'
import axios from 'axios'
import { getApiUrl } from '../../../utils/api'

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [
      { 
        role: 'assistant', 
        content: 'Welcome to the Neon Nexus. How can I assist you in this digital realm?' 
      }
    ],
    isLoading: false,
    notification: null
  })

  const sendMessage = async (input: string, neoApi: NeoAPI) => {
    if (!input.trim() || state.isLoading) return

    setState(prev => ({ ...prev, isLoading: true }))
    const userMessage = { role: 'user', content: input } as Message

    try {
      // Add user message
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage]
      }))

      // Add prepared response
      const preparedResponse = {
        role: 'assistant',
        content: PREPARED_RESPONSES[Math.floor(Math.random() * PREPARED_RESPONSES.length)]
      } as Message

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, preparedResponse]
      }))

      // Process with NeoAPI
      await neoApi.process(input)

      // Get AI response
      const response = await axios.post(getApiUrl('/api/chat'), {
        messages: [...state.messages, userMessage],
        systemInstruction: SYSTEM_INSTRUCTION
      })

      const aiMessage = {
        role: 'assistant',
        content: response.data.choices[0].message.content
      } as Message

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage]
      }))
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

  return {
    ...state,
    sendMessage,
    clearNotification
  }
} 