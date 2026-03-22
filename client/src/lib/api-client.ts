import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { toast } from 'sonner';
import { GATEWAY } from './gateway-paths';
import { getAccessToken, setAccessToken } from './access-token';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Skip attaching Bearer token (login/signup). */
    skipAuth?: boolean;
    /** Custom retry count for this request (5xx / network). */
    _retryCount?: number;
  }
}

const baseURL = import.meta.env.VITE_API_GATEWAY_URL?.replace(/\/$/, '') ?? '';
const kongApiKey = import.meta.env.VITE_KONG_API_KEY ?? '';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 600;

function onUnauthorized() {
  setAccessToken(null);
  try {
    localStorage.removeItem('vendex-auth');
  } catch {
  }
  window.dispatchEvent(new CustomEvent('vendex:unauthorized'));
  toast.error('Session expired. Please sign in again.');
  if (!window.location.pathname.startsWith('/login')) {
    window.location.assign('/login');
  }
}

function shouldRetry(status: number | undefined) {
  return status === undefined || status >= 500;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 45_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (kongApiKey) {
    config.headers.set('x-api-key', kongApiKey);
  }
  if (!config.skipAuth) {
    const t = getAccessToken();
    if (t) {
      config.headers.set('Authorization', `Bearer ${t}`);
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig | undefined;
    if (!config) return Promise.reject(error);

    const status = error.response?.status;

    if (status === 401 && !config.skipAuth) {
      onUnauthorized();
      return Promise.reject(error);
    }

    const isNetwork = error.code === 'ERR_NETWORK' || error.message === 'Network Error';
    if (shouldRetry(status) || isNetwork) {
      const count = config._retryCount ?? 0;
      if (count < MAX_RETRIES) {
        config._retryCount = count + 1;
        await delay(RETRY_DELAY_MS * (count + 1));
        return apiClient(config);
      }
      if (isNetwork) {
        toast.error('Network error. Please check your connection.');
      } else if (status && status >= 500) {
        toast.error('Server error. Please try again shortly.');
      }
    }

    return Promise.reject(error);
  }
);

/** Relative URLs under gateway (must include service prefix). */
export function gatewayUrl(path: string) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${baseURL}${p}`;
}

/** Socket.IO connects to messaging service through Kong. */
export function messagingSocketUrl() {
  return `${baseURL}${GATEWAY.messages}`;
}
