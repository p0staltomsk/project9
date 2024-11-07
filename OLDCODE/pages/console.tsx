// /var/www/html/project9/pages/console.tsx

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import getConfig from 'next/config'
import Head from 'next/head'
import { APIClient } from '../types/api'
import { SYSTEM_INSTRUCTION } from '../features/chat/model/constants'

const { publicRuntimeConfig } = getConfig()

const preparedResponses = [
  'Accessing the neural network...',
  'Decrypting your request...',
  'Scanning the digital horizon...',
  'Interfacing with the cybernetic mainframe...',
  'Compiling data from the neon archives...',
]

interface Message {
  content: string;
  role: 'user' | 'assistant' | 'system';
}

export default function CyberpunkConsoleChat() {
  const [messages, setMessages] = useState<Message[]>([
    { content: 'Welcome to the Neon Nexus Terminal. How can I assist you in this digital realm?', role: 'assistant' },
    { content: 'TIP: Enter \'comeback\' to return to the starting page.', role: 'system' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)  
  const router = useRouter()

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      setIsLoading(true)
      const userMessage: Message = { role: 'user', content: input }
      setMessages(prevMessages => [...prevMessages, userMessage])
      setInput('')

      if (input.toLowerCase() === 'comeback') {
        setMessages(prevMessages => [
          ...prevMessages,
          { content: 'Returning to the starting page...', role: 'system' },
        ])
        setIsLoading(false)
        setTimeout(() => router.push('/'), 1500)
        return
      }

      // Add a prepared response
      const preparedResponse: Message = { 
        role: 'assistant', 
        content: preparedResponses[Math.floor(Math.random() * preparedResponses.length)] 
      }
      setMessages(prevMessages => [...prevMessages, preparedResponse])

      try {
        const apiClient = new APIClient({
          endpoint: publicRuntimeConfig.neoApiEndpoint,
          apiKey: process.env.GROG_API_KEY
        })

        const response = await apiClient.processWithGrog(
          [...messages, userMessage],
          SYSTEM_INSTRUCTION
        )

        const aiMessage: Message = { 
          role: 'assistant', 
          content: response.choices[0].message.content 
        }
        setMessages(prevMessages => [...prevMessages, aiMessage])
      } catch (error) {
        console.error('Error:', error)
        const errorMessage: Message = { 
          role: 'assistant', 
          content: 'A glitch in the Matrix. Please try your request again.' 
        }
        setMessages(prevMessages => [...prevMessages, errorMessage])
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
