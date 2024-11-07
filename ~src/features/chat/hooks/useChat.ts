import { useState } from 'react';
import { Message, ChatHookReturn } from '../../../types';

export const useChat = (): ChatHookReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sendMessage = async (text: string): Promise<void> => {
    try {
      setIsLoading(true);
      const newMessage: Message = {
        id: Date.now().toString(),
        content: text
      };
      setMessages(prev => [...prev, newMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, sendMessage };
};