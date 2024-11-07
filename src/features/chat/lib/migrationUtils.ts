import { Message, ChatState } from '../model/types'

export const migrateOldMessages = (oldMessages: any[]): Message[] => {
  return oldMessages.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content
  }))
}

export const validateChatState = (state: ChatState): boolean => {
  return (
    Array.isArray(state.messages) &&
    state.messages.every(msg => 
      typeof msg.role === 'string' &&
      (msg.role === 'user' || msg.role === 'assistant') &&
      typeof msg.content === 'string'
    )
  )
} 