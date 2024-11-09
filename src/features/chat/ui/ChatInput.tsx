import React, { useState } from 'react'

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isRateLimited: boolean;
  cooldownTime: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit,
  isRateLimited,
  cooldownTime
}) => {
  const [input, setInput] = useState('')

  return (
    <form onSubmit={/* ... */}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isRateLimited}
        placeholder={
          isRateLimited
            ? `Neural network cooling down (${cooldownTime}s)...`
            : "Enter your message..."
        }
        className={`${isRateLimited ? 'opacity-50' : ''} /* ... остальные стили */`}
      />
      <button
        type="submit"
        disabled={isRateLimited}
        className={`
          ${isRateLimited ? 'cursor-not-allowed opacity-50' : 'hover:bg-green-400'}
          /* ... остальные стили */
        `}
      >
        {isRateLimited ? `Wait ${cooldownTime}s` : 'Send'}
      </button>
    </form>
  )
}
