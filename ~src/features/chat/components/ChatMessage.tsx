import { FC } from 'react';
import { Message } from '../../../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: FC<ChatMessageProps> = ({ message }): JSX.Element => {
  return (
    <div className="chat-message">
      <div className="message-content p-4 bg-white dark:bg-gray-900 rounded-lg">
        {message.content}
      </div>
    </div>
  );
}; 