export const queryKeys = {
  userProfile: ['user-profile'] as const,
  products: (filters: {
    page: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    vendor?: string;
  }) => ['products', filters] as const,
  product: (id: string) => ['product', id] as const,
  productReviews: (productId: string, page = 1, limit = 10) =>
    ['product-reviews', productId, { page, limit }] as const,
  categories: ['categories'] as const,
  orders: (filters: {
    customerId?: string;
    vendorScope?: 'me';
    status?: string;
    page: number;
    limit?: number;
  }) => ['orders', filters] as const,
  order: (id: string) => ['order', id] as const,
  vendorProduct: (id: string) => ['vendor-product', id] as const,
  vendorProducts: (page: number, isActive?: string) => ['vendor-products', { page, isActive }] as const,
  vendorVariants: (productId: string) => ['vendor-variants', productId] as const,
  vendorInventory: ['vendor-inventory'] as const,
  vendorInventoryAlerts: (threshold?: number) => ['vendor-inventory-alerts', threshold] as const,
  notifications: (userId: string) => ['notifications', userId] as const,
  analyticsHealth: ['analytics', 'health'] as const,
};
