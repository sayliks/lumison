/// <reference types="vite/client" />

declare module "*?worker&url" {
  const url: string;
  export default url;
}

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: Record<string, unknown>;
    __TAURI__?: {
      window: {
        getCurrent: () => {
          minimize: () => Promise<void>;
          maximize: () => Promise<void>;
          unmaximize: () => Promise<void>;
          close: () => Promise<void>;
          isMaximized: () => Promise<boolean>;
        };
      };
    };
  }
}

export {};
