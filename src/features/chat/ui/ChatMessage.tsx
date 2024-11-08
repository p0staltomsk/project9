import { motion } from 'framer-motion'
import { Message } from '../types'

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl p-3 rounded-lg 
          ${message.role === 'user' 
            ? 'bg-blue-900 bg-opacity-80' 
            : 'bg-green-900 bg-opacity-80'
          } 
          backdrop-blur-md border border-opacity-50 
          ${message.role === 'user' 
            ? 'border-blue-500' 
            : 'border-green-500'
          }`}
      >
        <p className={`text-sm md:text-base ${
          message.role === 'user' 
            ? 'text-blue-200' 
            : 'text-green-200'
        }`}>
          {message.content}
        </p>
      </div>
    </motion.div>
  )
} 