/** Canonical vendor area (per routing contract). */
export const VENDOR_BASE = '/vendor-dashboard';

export const vendorPaths = {
  home: VENDOR_BASE,
  products: `${VENDOR_BASE}/products`,
  productsNew: `${VENDOR_BASE}/products/new`,
  product: (id: string) => `${VENDOR_BASE}/products/${id}`,
  productEdit: (id: string) => `${VENDOR_BASE}/products/${id}/edit`,
  orders: `${VENDOR_BASE}/orders`,
  inventory: `${VENDOR_BASE}/inventory`,
  earnings: `${VENDOR_BASE}/earnings`,
} as const;

export function vendorRoute(suffix: string): string {
  if (!suffix || suffix === '/') return VENDOR_BASE;
  return `${VENDOR_BASE}${suffix.startsWith('/') ? suffix : `/${suffix}`}`;
}
