import { ReactNode } from 'react';

export interface MotionProps {
  children?: ReactNode;
  className?: string;
  initial?: Record<string, unknown>;
  animate?: Record<string, unknown>;
  exit?: Record<string, unknown>;
  transition?: Record<string, unknown>;
  whileHover?: Record<string, unknown>;
  whileTap?: Record<string, unknown>;
  onClick?: () => void;
  type?: 'submit' | 'button' | 'reset';
  disabled?: boolean;
}

export interface AnimatePresenceProps {
  children: ReactNode;
  mode?: 'sync' | 'wait' | 'popLayout';
  initial?: boolean;
  custom?: unknown;
  onExitComplete?: () => void;
  presenceAffectsLayout?: boolean;
} 