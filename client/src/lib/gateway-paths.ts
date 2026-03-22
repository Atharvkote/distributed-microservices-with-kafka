/**
 * Kong proxy path prefixes (strip_path: true on gateway).
 * Upstream services receive paths without these prefixes.
 */
export const GATEWAY = {
  auth: '/auth',
  orders: '/orders',
  payments: '/payments',
  messages: '/messages',
  analytics: '/analytics',
  catalog: '/catalog',
} as const;
