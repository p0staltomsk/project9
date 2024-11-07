// /var/www/html/project9/pages/index.tsx

import { useState } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { Message } from '../types';
import { useChat } from '../features/chat/hooks/useChat';
import { ChatMessage } from '../features/chat/components/ChatMessage';

export default function CyberpunkAIChat() {
  const { messages, isLoading, sendMessage } = useChat();
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    await sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen bg-black text-green-500 font-mono">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message: Message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-black border border-green-500 rounded p-2"
            disabled={isLoading}
          />
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-500 p-2 rounded"
          >
            <Send size={20} />
          </motion.button>
        </div>
      </form>
    </div>
  );
}
