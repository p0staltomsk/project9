import React from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface CyberNotificationProps {
  message: string
  onClose: () => void
}

export const CyberNotification: React.FC<CyberNotificationProps> = ({ message, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed bottom-24 right-4 z-50"
    >
      <div className="bg-red-900 bg-opacity-90 border border-red-500 rounded-lg p-4 text-red-300 flex items-center gap-2">
        <span>{message}</span>
        <button onClick={onClose} className="hover:text-red-100">
          <X size={16} />
        </button>
      </div>
    </motion.div>
  )
} 