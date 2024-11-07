declare module 'framer-motion' {
  import { FC, ReactNode } from 'react';

  interface MotionProps {
    initial?: Record<string, unknown>;
    animate?: Record<string, unknown>;
    exit?: Record<string, unknown>;
    transition?: Record<string, unknown>;
    className?: string;
    children?: ReactNode;
  }

  export const motion: {
    div: FC<MotionProps>;
    span: FC<MotionProps>;
    button: FC<MotionProps>;
  };

  export const AnimatePresence: FC<{ children: ReactNode }>;
}

declare module 'lucide-react' {
    export const Send: any
    export const Zap: any
    export const Brain: any
    export const Cpu: any
    export const Terminal: any
    export const Wifi: any
    export const X: any
} 

export {}; // Добавляем это для превращения файла в модуль