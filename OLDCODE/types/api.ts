import axios from 'axios'

export interface GrogAPIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface NeoAPIResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface APIConfig {
  endpoint: string;
  apiKey?: string;
}

export class APIClient {
  private grogEndpoint: string
  private neoEndpoint: string
  private apiKey?: string

  constructor(config: APIConfig) {
    this.grogEndpoint = process.env.NODE_ENV === 'production' 
      ? '/project9/api/chat'
      : '/api/chat'
    this.neoEndpoint = config.endpoint
    this.apiKey = config.apiKey
  }

  async processWithGrog(messages: any[], systemInstruction: string): Promise<GrogAPIResponse> {
    try {
      const response = await axios.post(this.grogEndpoint, 
        { messages, systemInstruction },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
          }
        }
      )

      return response.data
    } catch (error) {
      console.error('Grog API Error:', error)
      throw error
    }
  }

  async processWithNeo(_input: string): Promise<NeoAPIResponse> {
    try {
      return {
        success: false,
        error: 'Neo API is not available yet'
      }
    } catch (error) {
      console.error('Neo API Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
} 