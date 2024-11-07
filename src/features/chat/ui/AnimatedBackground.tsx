import { motion, AnimatePresence } from 'framer-motion'
import { useClientOnly } from '../hooks/useClientOnly'
import { WindowSize } from '../types'

interface AnimatedBackgroundProps {
  windowSize: WindowSize;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ windowSize }) => {
  const clientWindowSize = useClientOnly(windowSize)

  if (!clientWindowSize) return null

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-50" />
      <AnimatePresence>
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-green-500 mix-blend-screen filter blur-xl opacity-30"
            initial={{ 
              scale: 0, 
              x: Math.random() * clientWindowSize.width, 
              y: Math.random() * clientWindowSize.height 
            }}
            animate={{
              scale: [1, 2, 2, 1, 1],
              x: [
                Math.random() * clientWindowSize.width,
                Math.random() * clientWindowSize.width,
                Math.random() * clientWindowSize.width
              ],
              y: [
                Math.random() * clientWindowSize.height,
                Math.random() * clientWindowSize.height,
                Math.random() * clientWindowSize.height
              ],
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              repeatType: 'reverse',
              ease: 'linear'
            }}
            style={{
              width: `${Math.random() * 300 + 50}px`,
              height: `${Math.random() * 300 + 50}px`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
} 