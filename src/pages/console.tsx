import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import getConfig from 'next/config'
import Head from 'next/head'
import { CONSOLE_SYSTEM_INSTRUCTION, PREPARED_RESPONSES } from '../features/chat/model/constants'

const { publicRuntimeConfig } = getConfig()

interface Message {
  content: string;
  role: 'user' | 'assistant' | 'system';
  isTemporary?: boolean;
}

export default function CyberpunkConsoleChat() {
  const [messages, setMessages] = useState<Message[]>([
    { content: 'Welcome to the Neon Nexus Terminal. How can I assist you in this digital realm?', role: 'assistant' },
    { content: 'TIP: Enter \'comeback\' to return to the starting page.', role: 'system' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFirstMessage, setIsFirstMessage] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)  
  const router = useRouter()

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      setIsLoading(true)
      const userMessage = input.trim()
      setMessages(prevMessages => [...prevMessages, { role: 'user', content: userMessage }])
      setInput('')

      if (userMessage.toLowerCase() === 'comeback') {
        setMessages(prevMessages => [
          ...prevMessages,
          { content: 'Returning to the starting page...', role: 'system' },
        ])
        setIsLoading(false)
        setTimeout(() => router.push('/'), 1500)
        return
      }

      try {
        // Добавляем промежуточное сообщение
        const preparedResponse = PREPARED_RESPONSES[Math.floor(Math.random() * PREPARED_RESPONSES.length)]
        setMessages(prevMessages => [...prevMessages, { 
          role: 'assistant', 
          content: preparedResponse,
          isTemporary: true 
        }])

        // Формируем контекст для API
        const context = [
          ...(isFirstMessage ? [{ role: 'system', content: CONSOLE_SYSTEM_INSTRUCTION }] : []),
          ...messages
            .filter(msg => !msg.isTemporary && !PREPARED_RESPONSES.includes(msg.content))
            .map(msg => ({
              role: msg.role,
              content: msg.content.trim()
            }))
        ]

        if (isFirstMessage) {
          setIsFirstMessage(false)
        }

        const response = await fetch('/project9/api/neo/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            context: context
          })
        })

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const data = await response.json()
        
        if (data.status === 'success' && data.message) {
          const cleanedMessage = data.message.trim().replace(/\n+/g, ' ')
          setMessages(prevMessages => [
            ...prevMessages,
            { role: 'assistant', content: cleanedMessage }
          ])

          if (data.metrics && !data.metrics.error) {
            console.log('Message metrics:', data.metrics)
          }
        } else {
          throw new Error(data.error || 'Unknown error occurred')
        }
      } catch (error) {
        console.error('Error:', error)
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'assistant', content: 'A glitch in the Matrix. Please try your request again.' }
        ])
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [isLoading, messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <>
      <Head>
        <title>Terminal Console | Neon Nexus</title>
        <link rel="icon" href={`${publicRuntimeConfig.basePath}/favicon.ico`} />
      </Head>
      <div className="flex flex-col h-screen bg-black text-green-500 font-mono p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-green-300">NeonNexus_v2.0</h1>
          <p className="text-xs text-green-700">Cybernetic Interface Terminal</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {messages.map((message, index) => (
            <motion.div
              key={index}        
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 50 }}
              className={`${
                message.role === 'user'
                  ? 'text-cyan-400'
                  : message.role === 'system'
                    ? 'text-yellow-500'
                    : 'text-green-500'
              }`}
            >
              <span className="mr-2">
                {message.role === 'user' ? '>' : message.role === 'system' ? '!' : '#'}
              </span>
              {message.content}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="flex items-center space-x-2">
          <span className="text-green-700">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-b border-green-700 focus:border-green-500 outline-none text-green-300 placeholder-green-700"
            placeholder="Enter command..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-4 py-2 bg-green-900 text-green-300 rounded ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-800'
            }`}
            disabled={isLoading}
          >
            Execute
          </button>
        </form>

        {isLoading && (
          <div className="mt-2 text-green-500">
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              Processing...
            </motion.span>
          </div>
        )}
      </div>
    </>
  )
}
