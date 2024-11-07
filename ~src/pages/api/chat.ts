import { NextApiRequest, NextApiResponse } from 'next';
import { APIResponse } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse>
): Promise<void> {
  try {
    const { message } = req.body;
    const messageId = Date.now().toString();
    
    // Базовый ответ без метрик
    res.status(200).json({
      id: messageId,
      message: `Response to: ${message}`,
      choices: [{
        message: {
          content: `Response to: ${message}`
        }
      }]
    });

    /* Metrics temporarily disabled
    const neoResponse = await fetch('http://localhost:8000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        llm_response: llmResponse,
        metadata: {
          message_id: messageId,
          model: "llama3-groq-70b",
          source: "grog_ai"
        }
      })
    });

    const neoData = await neoResponse.json();
    */

  } catch (error) {
    res.status(500).json({
      id: Date.now().toString(),
      message: 'Error processing request'
    });
  }
} 