// Mock API service layer — replace with real endpoints in production

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  vendorId: string;
  vendorName: string;
  stock: number;
  tags: string[];
  status: 'active' | 'pending' | 'rejected';
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: { productId: string; name: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  avatar: string;
  rating: number;
  productCount: number;
  totalSales: number;
  status: 'active' | 'pending' | 'suspended';
  joinedAt: string;
}

export interface AnalyticsData {
  label: string;
  revenue: number;
  orders: number;
  visitors: number;
}

const mockProducts: Product[] = [
  {
    id: 'p1', name: 'Wireless Pro Headphones', description: 'Premium noise-cancelling wireless headphones with 40-hour battery life and spatial audio support.', price: 299.99, originalPrice: 399.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
    category: 'Electronics', rating: 4.8, reviewCount: 234, vendorId: 'v1', vendorName: 'AudioTech Pro', stock: 45, tags: ['wireless', 'bluetooth', 'premium'], status: 'active', createdAt: '2026-01-15',
  },
  {
    id: 'p2', name: 'Minimalist Leather Backpack', description: 'Handcrafted genuine leather backpack with laptop compartment and waterproof lining.', price: 189.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'],
    category: 'Fashion', rating: 4.6, reviewCount: 128, vendorId: 'v2', vendorName: 'UrbanCraft', stock: 32, tags: ['leather', 'handmade', 'laptop'], status: 'active', createdAt: '2026-02-01',
  },
  {
    id: 'p3', name: 'Smart Fitness Watch', description: 'Advanced fitness tracker with heart rate monitor, GPS, and smart notifications.', price: 199.99, originalPrice: 249.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
    category: 'Electronics', rating: 4.7, reviewCount: 412, vendorId: 'v3', vendorName: 'WearTech', stock: 78, tags: ['fitness', 'smartwatch', 'gps'], status: 'active', createdAt: '2026-01-20',
  },
  {
    id: 'p4', name: 'Organic Coffee Beans', description: 'Single-origin arabica coffee beans from Ethiopian highlands, medium roast.', price: 24.99,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800'],
    category: 'Food & Drink', rating: 4.9, reviewCount: 567, vendorId: 'v4', vendorName: 'Bean Origins', stock: 200, tags: ['organic', 'coffee', 'arabica'], status: 'active', createdAt: '2026-02-10',
  },
  {
    id: 'p5', name: 'Mechanical Keyboard RGB', description: 'Hot-swappable mechanical keyboard with per-key RGB and aluminum frame.', price: 159.99, originalPrice: 199.99,
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400', images: ['https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800'],
    category: 'Electronics', rating: 4.5, reviewCount: 189, vendorId: 'v1', vendorName: 'AudioTech Pro', stock: 56, tags: ['mechanical', 'rgb', 'gaming'], status: 'active', createdAt: '2026-02-15',
  },
  {
    id: 'p6', name: 'Yoga Mat Premium', description: 'Non-slip natural rubber yoga mat with alignment lines and carrying strap.', price: 69.99,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800'],
    category: 'Sports', rating: 4.4, reviewCount: 98, vendorId: 'v5', vendorName: 'FitGear Co', stock: 120, tags: ['yoga', 'fitness', 'non-slip'], status: 'active', createdAt: '2026-02-20',
  },
  {
    id: 'p7', name: 'Wireless Charging Pad', description: 'Fast-charging wireless pad compatible with all Qi-enabled devices.', price: 39.99,
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400', images: ['https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800'],
    category: 'Electronics', rating: 4.3, reviewCount: 76, vendorId: 'v3', vendorName: 'WearTech', stock: 150, tags: ['wireless', 'charging', 'qi'], status: 'pending', createdAt: '2026-03-01',
  },
  {
    id: 'p8', name: 'Canvas Art Print Set', description: 'Set of 3 abstract canvas prints in modern geometric style.', price: 89.99,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400', images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800'],
    category: 'Home & Decor', rating: 4.6, reviewCount: 55, vendorId: 'v2', vendorName: 'UrbanCraft', stock: 40, tags: ['art', 'canvas', 'abstract'], status: 'active', createdAt: '2026-03-05',
  },
];

const mockOrders: Order[] = [
  { id: 'ORD-001', customerId: 'u1', customerName: 'Alex Rivera', items: [{ productId: 'p1', name: 'Wireless Pro Headphones', quantity: 1, price: 299.99 }], total: 299.99, status: 'delivered', createdAt: '2026-03-10', shippingAddress: '123 Main St, New York, NY' },
  { id: 'ORD-002', customerId: 'u1', customerName: 'Alex Rivera', items: [{ productId: 'p3', name: 'Smart Fitness Watch', quantity: 1, price: 199.99 }, { productId: 'p5', name: 'Mechanical Keyboard RGB', quantity: 1, price: 159.99 }], total: 359.98, status: 'shipped', createdAt: '2026-03-12', shippingAddress: '123 Main St, New York, NY' },
  { id: 'ORD-003', customerId: 'c2', customerName: 'Emma Watson', items: [{ productId: 'p2', name: 'Minimalist Leather Backpack', quantity: 1, price: 189.99 }], total: 189.99, status: 'processing', createdAt: '2026-03-13', shippingAddress: '456 Oak Ave, Los Angeles, CA' },
  { id: 'ORD-004', customerId: 'c3', customerName: 'Marcus Lee', items: [{ productId: 'p4', name: 'Organic Coffee Beans', quantity: 3, price: 24.99 }], total: 74.97, status: 'pending', createdAt: '2026-03-14', shippingAddress: '789 Pine Rd, Chicago, IL' },
  { id: 'ORD-005', customerId: 'c4', customerName: 'Lisa Park', items: [{ productId: 'p6', name: 'Yoga Mat Premium', quantity: 1, price: 69.99 }], total: 69.99, status: 'delivered', createdAt: '2026-03-08', shippingAddress: '321 Elm St, Austin, TX' },
  { id: 'ORD-006', customerId: 'c5', customerName: 'David Kim', items: [{ productId: 'p8', name: 'Canvas Art Print Set', quantity: 2, price: 89.99 }], total: 179.98, status: 'cancelled', createdAt: '2026-03-09', shippingAddress: '654 Maple Dr, Seattle, WA' },
];

const mockVendors: Vendor[] = [
  { id: 'v1', name: 'AudioTech Pro', email: 'contact@audiotech.com', avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=AT', rating: 4.8, productCount: 24, totalSales: 45200, status: 'active', joinedAt: '2025-06-15' },
  { id: 'v2', name: 'UrbanCraft', email: 'hello@urbancraft.com', avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=UC', rating: 4.6, productCount: 18, totalSales: 32100, status: 'active', joinedAt: '2025-08-20' },
  { id: 'v3', name: 'WearTech', email: 'info@weartech.com', avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=WT', rating: 4.7, productCount: 31, totalSales: 67800, status: 'active', joinedAt: '2025-05-10' },
  { id: 'v4', name: 'Bean Origins', email: 'brew@beanorigins.com', avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=BO', rating: 4.9, productCount: 12, totalSales: 28400, status: 'active', joinedAt: '2025-09-01' },
  { id: 'v5', name: 'FitGear Co', email: 'support@fitgear.com', avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=FG', rating: 4.4, productCount: 15, totalSales: 19600, status: 'pending', joinedAt: '2026-01-15' },
  { id: 'v6', name: 'NovaTech', email: 'sales@novatech.com', avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=NT', rating: 3.9, productCount: 8, totalSales: 8200, status: 'suspended', joinedAt: '2025-11-20' },
];

const mockAnalytics: AnalyticsData[] = [
  { label: 'Jan', revenue: 42000, orders: 320, visitors: 12400 },
  { label: 'Feb', revenue: 48000, orders: 380, visitors: 14200 },
  { label: 'Mar', revenue: 55000, orders: 420, visitors: 16800 },
  { label: 'Apr', revenue: 51000, orders: 390, visitors: 15600 },
  { label: 'May', revenue: 62000, orders: 480, visitors: 18900 },
  { label: 'Jun', revenue: 58000, orders: 450, visitors: 17500 },
  { label: 'Jul', revenue: 71000, orders: 540, visitors: 21200 },
  { label: 'Aug', revenue: 68000, orders: 510, visitors: 20100 },
  { label: 'Sep', revenue: 75000, orders: 580, visitors: 22800 },
  { label: 'Oct', revenue: 82000, orders: 630, visitors: 25100 },
  { label: 'Nov', revenue: 91000, orders: 710, visitors: 28400 },
  { label: 'Dec', revenue: 98000, orders: 780, visitors: 31200 },
];

export const api = {
  products: {
    getAll: async (): Promise<Product[]> => { await delay(300); return mockProducts; },
    getById: async (id: string): Promise<Product | undefined> => { await delay(200); return mockProducts.find((p) => p.id === id); },
    getByCategory: async (cat: string): Promise<Product[]> => { await delay(300); return mockProducts.filter((p) => p.category === cat); },
    getByVendor: async (vendorId: string): Promise<Product[]> => { await delay(300); return mockProducts.filter((p) => p.vendorId === vendorId); },
  },
  orders: {
    getAll: async (): Promise<Order[]> => { await delay(300); return mockOrders; },
    getById: async (id: string): Promise<Order | undefined> => { await delay(200); return mockOrders.find((o) => o.id === id); },
    getByCustomer: async (customerId: string): Promise<Order[]> => { await delay(300); return mockOrders.filter((o) => o.customerId === customerId); },
  },
  vendors: {
    getAll: async (): Promise<Vendor[]> => { await delay(300); return mockVendors; },
    getById: async (id: string): Promise<Vendor | undefined> => { await delay(200); return mockVendors.find((v) => v.id === id); },
  },
  analytics: {
    getOverview: async (): Promise<AnalyticsData[]> => { await delay(400); return mockAnalytics; },
  },
};
