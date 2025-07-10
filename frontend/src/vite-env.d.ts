/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
  readonly VITE_API_URL?: string
  readonly VITE_APP_TITLE?: string
  // Add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
