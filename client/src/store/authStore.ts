import { create } from 'zustand';

export type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

const mockUsers: Record<string, User> = {
  'customer@demo.com': {
    id: 'u1',
    name: 'Alex Rivera',
    email: 'customer@demo.com',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alex',
    role: 'customer',
  },
  'vendor@demo.com': {
    id: 'u2',
    name: 'Sarah Chen',
    email: 'vendor@demo.com',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sarah',
    role: 'vendor',
  },
  'admin@demo.com': {
    id: 'u3',
    name: 'Jordan Park',
    email: 'admin@demo.com',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jordan',
    role: 'admin',
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: mockUsers['customer@demo.com'],
  isAuthenticated: true,
  isLoading: false,

  login: async (email: string, _password: string) => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 800));
    const user = mockUsers[email] || mockUsers['customer@demo.com'];
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },
}));
