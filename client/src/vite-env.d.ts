/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_GATEWAY_URL?: string;
  readonly VITE_KONG_API_KEY?: string;
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly VITE_DEFAULT_CURRENCY?: string;
  readonly VITE_ADMIN_EMAILS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
}
