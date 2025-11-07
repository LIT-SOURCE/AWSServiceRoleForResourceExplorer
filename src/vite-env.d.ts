/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AMPLIFY_CONFIG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
