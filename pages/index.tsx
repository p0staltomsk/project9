// /var/www/html/project9/pages/index.tsx

import React, { useState, useEffect, useRef } from 'react'
import { Send, Zap, Brain, Cpu, Terminal, Wifi } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { debounce } from 'lodash' // Добавьте эту строку в начало файла
import Link from 'next/link'
import getConfig from 'next/config'
import Head from 'next/head'
import { getApiUrl } from '../utils/api'
import { NeoAPI } from '../types/neo-api'
import { CyberNotification } from '../components/CyberNotification'
import { useChat } from '../features/chat/hooks/useChat'
import { ChatMessage } from '../features/chat/ui/ChatMessage'

// Добавьте эту строку в начало файла, после импортов
const { publicRuntimeConfig } = getConfig()

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = debounce(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }, 250) // Задержка в 250 мс

      window.addEventListener('resize', handleResize)
      handleResize()

      return () => {
        window.removeEventListener('resize', handleResize)
        handleResize.cancel() // Отмена отложенного вызова при размонтировании
      }
    }
  }, [])

  return windowSize
}

export default function CyberpunkAIChat() {
  const { messages, isLoading, notification, sendMessage, clearNotification } = useChat()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const windowSize = useWindowSize()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const neoApi = new NeoAPI({
      endpoint: publicRuntimeConfig.neoApiEndpoint
    })
    await sendMessage(input, neoApi)
    setInput('')
  }

  // Устанавливаем фокус на input после обновления компонента
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    if (inputRef.current) {
      inputRef.current.focus() // устанавливаем фокус на поле ввода
    }
  }, [messages])

  return (
    <>
      <Head>
        <title>Neon Nexus AI Chat</title>
        <link rel="icon" href={`${publicRuntimeConfig.basePath}/favicon.ico`} />
      </Head>
      <div className="flex flex-col h-screen bg-black text-green-500 font-mono overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <AnimatePresence>
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-green-500 mix-blend-screen filter blur-xl"
                initial={{ scale: 0, x: Math.random() * windowSize.width, y: Math.random() * windowSize.height }}
                animate={{
                  scale: [1, 2, 2, 1, 1],
                  x: [null, Math.random() * windowSize.width, Math.random() * windowSize.width],
                  y: [null, Math.random() * windowSize.height, Math.random() * windowSize.height],
                }}
                transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
                style={{
                  width: `${Math.random() * 300 + 50}px`,
                  height: `${Math.random() * 300 + 50}px`,
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Header */}
        <header className="relative z-10 flex items-center justify-between p-4 bg-black bg-opacity-70 border-b border-green-500 backdrop-blur-md">
          <h1 className="text-2xl font-bold text-green-300 tracking-wider">Neon Nexus AI</h1>
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Zap className="text-yellow-400" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Brain className="text-purple-400" />
            </motion.div>
            <Link href="/cyber-personal-account">
              <Cpu className="text-blue-400 animate-pulse" />
            </Link>
            <Link href="/console">
              <Terminal className="text-red-400" />
            </Link>
            <Link href="https://web.89281112.xyz/" title='Назад'>
              <Wifi className="text-green-400" />
            </Link>
          </div>
        </header>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
          <AnimatePresence>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSubmit} className="relative z-10 p-4 bg-black bg-opacity-70 border-t border-green-500 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              ref={inputRef} // добавляем реф к input
              className="flex-1 bg-black bg-opacity-50 border border-green-500 rounded-md p-2 text-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-green-700"
              placeholder="Enter your command..."
              disabled={isLoading}
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-green-500 text-black rounded-md p-2 transition-colors duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-400'
                }`}
              disabled={isLoading}
            >
              <Send size={20} />
            </motion.button>
          </div>
        </form>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-t-2 border-green-500 rounded-full"
            ></motion.div>
          </div>
        )}

        <AnimatePresence>
          {notification && (
            <CyberNotification 
              message={notification}
              onClose={clearNotification}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
