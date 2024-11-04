import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

type Message = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { messages, systemInstruction } = req.body
      console.log('Received messages:', messages)
      console.log('System instruction:', systemInstruction)

      if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not set')
      }

      const fullMessages: Message[] = [
        { role: 'system', content: systemInstruction },
        ...messages
      ]

      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'mixtral-8x7b-32768',
          messages: fullMessages,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('API response:', response.data)

      res.status(200).json(response.data)
    } catch (error) {
      console.error('Detailed error:', error)
      res.status(500).json({ error: 'An error occurred while processing your request.', details: error.message })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}