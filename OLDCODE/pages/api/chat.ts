import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

interface GrogResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GrogResponse | ErrorResponse>
) {
  if (req.method === 'POST') {
    try {
      const response = await axios.post(
        'https://api.grog.ai/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: req.body.messages,
          system_message: req.body.systemInstruction,
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROG_API_KEY}`
          }
        }
      )

      res.status(200).json(response.data)
    } catch (error) {
      console.error('API Error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      res.status(500).json({ 
        error: 'An error occurred while processing your request.',
        details: errorMessage
      })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ error: 'Method not allowed' })
  }
}