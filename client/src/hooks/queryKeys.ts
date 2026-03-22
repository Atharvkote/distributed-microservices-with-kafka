export const queryKeys = {
  products: (page: number, category?: string, search?: string) =>
    ['products', { page, category, search }] as const,
  product: (id: string) => ['product', id] as const,
  categories: ['categories'] as const,
  orders: (filters: { customerId?: string; status?: string; page: number }) =>
    ['orders', filters] as const,
  order: (id: string) => ['order', id] as const,
  vendorProduct: (id: string) => ['vendor-product', id] as const,
  notifications: (userId: string) => ['notifications', userId] as const,
  analyticsHealth: ['analytics', 'health'] as const,
};
