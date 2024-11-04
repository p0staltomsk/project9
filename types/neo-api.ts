export interface NeoAPIConfig {
  endpoint: string;
}

export class NeoAPI {
  private endpoint: string;

  constructor(config: NeoAPIConfig) {
    this.endpoint = config.endpoint;
  }

  async process(data: any): Promise<any> {
    // Здесь может быть ваша логика обработки
    return data;
  }
} 