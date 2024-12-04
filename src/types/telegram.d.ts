interface TelegramWebApp {
  WebApp: {
    ready(): void;
    expand(): void;
    close(): void;
  }
}

declare global {
  interface Window {
    Telegram?: TelegramWebApp;
  }
}

export {}; 