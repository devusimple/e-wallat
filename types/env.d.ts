declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_CURRENCY_API_KEY: string;
      EXPO_PUBLIC_SYNC_API_URL: string;
    }
  }
}

export {};