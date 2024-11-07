declare module '@groq/sdk' {
  export class groq {
    constructor(config: { apiKey: string });
    chat: {
      completions: {
        create(params: {
          model: string;
          messages: Array<{
            role: string;
            content: string;
          }>;
        }): Promise<{
          choices: Array<{
            message: {
              content: string;
            };
          }>;
        }>;
      };
    };
  }
} 