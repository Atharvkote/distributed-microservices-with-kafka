import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { authApi } from '@/api/auth.api';
import { setAccessToken } from '@/lib/access-token';
import { parseJwtPayload } from '@/lib/jwt';

export type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

function resolveRole(email: string, isVendor: boolean): UserRole {
  const raw = import.meta.env.VITE_ADMIN_EMAILS;
  const admins = raw
    ? raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    : [];
  if (admins.includes(email.toLowerCase())) return 'admin';
  if (isVendor) return 'vendor';
  return 'customer';
}

function axiosMessage(e: unknown): string {
  if (e && typeof e === 'object' && 'response' in e) {
    const r = (e as {
      response?: {
        data?: { message?: string; errors?: Record<string, string[] | undefined> };
      };
    }).response;
    if (r?.data?.message) return String(r.data.message);
    const fieldErrors = r?.data?.errors;
    if (fieldErrors && typeof fieldErrors === 'object') {
      const first = Object.values(fieldErrors).flat().find(Boolean);
      if (first) return String(first);
    }
  }
  return 'Something went wrong';
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { full_name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  bootstrap: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      authReady: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login({ email, password });
          const claims = parseJwtPayload(data.token);
          const isVendor = Boolean(claims?.isVendor);
          const user: User = {
            id: data.user._id,
            name: data.user.full_name,
            email: data.user.email,
            avatar: data.user.profile_picture || '',
            role: resolveRole(data.user.email, isVendor),
          };
          setAccessToken(data.token);
          set({
            token: data.token,
            user,
            isAuthenticated: true,
            isLoading: false,
            authReady: true,
          });
          toast.success(data.message || 'Signed in');
        } catch (e) {
          set({ isLoading: false });
          toast.error(axiosMessage(e));
          throw e;
        }
      },

      register: async ({ full_name, email, password }) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.signup({ full_name, email, password });
          const token = data.accessToken ?? data.token;
          if (!token) {
            set({ isLoading: false });
            toast.error('Registration succeeded but no token was returned');
            throw new Error('Missing token');
          }
          const claims = parseJwtPayload(token);
          const isVendor = Boolean(claims?.isVendor);
          const user: User = {
            id: data.user._id,
            name: data.user.full_name,
            email: data.user.email,
            avatar: data.user.profile_picture || '',
            role: resolveRole(data.user.email, isVendor),
          };
          setAccessToken(token);
          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
            authReady: true,
          });
          toast.success(data.message || 'Account created');
        } catch (e) {
          set({ isLoading: false });
          toast.error(axiosMessage(e));
          throw e;
        }
      },

      logout: async () => {
        try {
          if (get().token) await authApi.logout();
        } catch {
          /* ignore network errors on logout */
        }
        setAccessToken(null);
        set({ token: null, user: null, isAuthenticated: false });
      },

      bootstrap: async () => {
        const token = get().token;
        setAccessToken(token);
        if (!token) {
          set({ authReady: true, isAuthenticated: false, user: null });
          return;
        }
        try {
          const { data } = await authApi.checkAuth();
          const claims = parseJwtPayload(token);
          const isVendor = Boolean(claims?.isVendor);
          const user: User = {
            id: data.user.id,
            name: (claims?.full_name as string) || data.user.email.split('@')[0],
            email: data.user.email,
            avatar: '',
            role: resolveRole(data.user.email, isVendor),
          };
          set({ user, isAuthenticated: true, authReady: true });
        } catch {
          setAccessToken(null);
          set({ token: null, user: null, isAuthenticated: false, authReady: true });
        }
      },
    }),
    {
      name: 'vendex-auth',
      partialize: (s) => ({ token: s.token }),
    }
  )
);
