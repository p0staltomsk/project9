// /var/www/html/project9/pages/index.tsx

import React, { useState, useEffect, useRef } from 'react'
import { Send, Zap, Brain, Cpu, Terminal, Wifi } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { debounce } from 'lodash'
import Link from 'next/link'
import getConfig from 'next/config'
import Head from 'next/head'
import { CyberNotification } from '../components/CyberNotification'
import { useChat } from '../features/chat/hooks/useChat'
import { ChatMessage } from '../features/chat/ui/ChatMessage'
import { AnimatedBackground } from '../features/chat/ui/AnimatedBackground'
import { APIClient } from '../types/api'

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
      }, 250)

      window.addEventListener('resize', handleResize)
      handleResize()

      return () => {
        window.removeEventListener('resize', handleResize)
        handleResize.cancel()
      }
    }
  }, [])

  return windowSize
}

function useClientOnly<T>(value: T): T | null {
  const [clientValue, setClientValue] = useState<T | null>(null)
  
  useEffect(() => {
    setClientValue(value)
  }, [value])
  
  return clientValue
}

export default function CyberpunkAIChat() {
  const { messages, isLoading, notification, sendMessage, clearNotification, setSystemError } = useChat()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const windowSize = useWindowSize()

  const clientWindowSize = useClientOnly(windowSize)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const apiClient = new APIClient({
      endpoint: publicRuntimeConfig.neoApiEndpoint,
      apiKey: process.env.GROG_API_KEY
    })
    await sendMessage(input, apiClient)
    setInput('')
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [messages])

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Runtime error:', error)
      setSystemError('SYSTEM ERROR: Neural interface malfunction detected')
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [setSystemError])

  if (!messages || !sendMessage) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-green-500">
        <div className="text-center">
          <h1 className="text-2xl mb-4">SYSTEM INITIALIZATION...</h1>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-t-2 border-green-500 rounded-full mx-auto"
          />
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Neon Nexus AI Chat</title>
        <link rel="icon" href={`${publicRuntimeConfig.basePath}/favicon.ico`} />
      </Head>
      <div className="flex flex-col h-screen bg-black text-green-500 font-mono overflow-hidden">
        <AnimatedBackground windowSize={clientWindowSize || windowSize} />

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

        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
          <AnimatePresence>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 p-4 bg-black bg-opacity-70 border-t border-green-500 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              ref={inputRef}
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
