import { Message } from '@/features/chat/model/types'

export interface ChatMessageProps {
  message: Message;
}

export interface CyberNotificationProps {
  message: string;
  onClose: () => void;
}

export interface AnimatedBackgroundProps {
  windowSize: {
    width: number;
    height: number;
  };
} 