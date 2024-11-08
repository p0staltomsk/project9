import React from 'react'
import { motion } from 'framer-motion'
import { AIMetrics } from './AIMetrics'
import { Message, Metrics } from '../types'

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`max-w-[80%] ${
        isAssistant
          ? 'bg-black border-l-4 border-l-purple-500'
          : 'bg-green-900/80 border-r-4 border-r-green-500'
        } p-4 rounded-lg border border-green-500/50 shadow-lg backdrop-blur-sm`}
      >
        <p className="text-green-300">{message.content}</p>
        {isAssistant && message.metrics && (
          <AIMetrics metrics={message.metrics} />
        )}
      </div>
    </motion.div>
  )
}
