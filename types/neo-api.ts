export interface NeoAPIConfig {
  endpoint: string;
}

export interface ProcessData {
  input: string;
  [key: string]: unknown;
}

export interface ProcessResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export class NeoAPI {
  private endpoint: string

  constructor(config: NeoAPIConfig) {
    this.endpoint = config.endpoint
  }

  async process(data: ProcessData): Promise<ProcessResponse> {
    return {
      success: true,
      data: data.input
    }
  }
} 