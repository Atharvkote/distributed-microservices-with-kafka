import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { authApi, type AuthUserDto } from '@/api/auth.api';
import { usersApi } from '@/api/users.api';
import { setAccessToken } from '@/lib/access-token';
import { parseJwtPayload, type JwtPayloadShape } from '@/lib/jwt';
import {
  computeProfileCompleted,
  type UserAddressDto,
  type UserProfileSummary,
} from '@/lib/profile-utils';

export type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  phone?: string;
  address?: UserAddressDto;
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

function makeUserFromLoginDto(
  dto: AuthUserDto,
  profile: UserProfileSummary | null,
  claims: JwtPayloadShape | null,
): User {
  const isVendor = Boolean(claims?.isVendor);
  const role = resolveRole(dto.email, isVendor);
  const name =
    profile?.full_name?.trim() ||
    dto.full_name ||
    (claims?.full_name as string) ||
    dto.email.split('@')[0];
  return {
    id: dto._id,
    email: dto.email,
    name,
    avatar: profile?.profile_picture || dto.profile_picture || '',
    role,
    phone: profile?.phone ?? dto.phone,
    address: profile?.address,
  };
}

function makeUserFromCheckAuth(
  cu: { id: string; email: string; vendorId?: string | null },
  profile: UserProfileSummary | null,
  claims: JwtPayloadShape | null,
): User {
  const isVendor = Boolean(claims?.isVendor);
  const role = resolveRole(cu.email, isVendor);
  const name =
    profile?.full_name?.trim() ||
    (claims?.full_name as string) ||
    cu.email.split('@')[0];
  return {
    id: cu.id,
    email: cu.email,
    name,
    avatar: profile?.profile_picture || '',
    role,
    phone: profile?.phone,
    address: profile?.address,
  };
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

async function fetchProfileSummarySafe(): Promise<UserProfileSummary | null> {
  try {
    const { data } = await usersApi.fetchSummary();
    return data;
  } catch {
    return null;
  }
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authReady: boolean;
  isVendor: boolean;
  vendorId: string | null;
  profileCompleted: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { full_name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  applyRefreshedToken: (token: string) => void;
  patchUserFromProfileDoc: (doc: UserProfileSummary) => void;
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
      isVendor: false,
      vendorId: null,
      profileCompleted: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
          isVendor: user.role === 'vendor',
          vendorId: get().vendorId,
        }),

      applyRefreshedToken: (token) => {
        const claims = parseJwtPayload(token);
        if (!claims) return;
        setAccessToken(token);
        set((s) => {
          if (!s.user) {
            return {
              token,
              isVendor: Boolean(claims.isVendor),
              vendorId: (claims.vendorId ?? null) as string | null,
            };
          }
          const isVendor = Boolean(claims.isVendor);
          const nextRole = resolveRole(s.user.email, isVendor);
          return {
            token,
            isVendor,
            vendorId: (claims.vendorId ?? null) as string | null,
            user: {
              ...s.user,
              role: nextRole,
              name: (claims.full_name as string) || s.user.name,
            },
          };
        });
      },

      patchUserFromProfileDoc: (doc) => {
        const docId = typeof doc._id === 'string' ? doc._id : String(doc._id);
        set((s) => {
          if (!s.user || s.user.id !== docId) return {};
          const profileCompleted = s.user.role === 'admin' || computeProfileCompleted(doc);
          return {
            profileCompleted,
            user: {
              ...s.user,
              name: doc.full_name || s.user.name,
              phone: doc.phone,
              address: doc.address,
              avatar: doc.profile_picture || s.user.avatar,
            },
          };
        });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login({ email, password });
          const token = data.token;
          const claims = parseJwtPayload(token);
          const profile = await fetchProfileSummarySafe();
          const user = makeUserFromLoginDto(data.user, profile, claims);
          const profileCompleted = user.role === 'admin' || computeProfileCompleted(profile);
          const isVendor = Boolean(claims?.isVendor);
          const vendorId = (claims?.vendorId ?? null) as string | null;
          setAccessToken(token);
          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
            authReady: true,
            isVendor,
            vendorId,
            profileCompleted,
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
          const profile = await fetchProfileSummarySafe();
          const user = makeUserFromLoginDto(data.user, profile, claims);
          const profileCompleted = user.role === 'admin' || computeProfileCompleted(profile);
          const isVendor = Boolean(claims?.isVendor);
          const vendorId = (claims?.vendorId ?? null) as string | null;
          setAccessToken(token);
          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
            authReady: true,
            isVendor,
            vendorId,
            profileCompleted,
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
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isVendor: false,
          vendorId: null,
          profileCompleted: false,
        });
      },

      bootstrap: async () => {
        const token = get().token;
        setAccessToken(token);
        if (!token) {
          set({
            authReady: true,
            isAuthenticated: false,
            user: null,
            isVendor: false,
            vendorId: null,
            profileCompleted: false,
          });
          return;
        }
        try {
          const { data } = await authApi.checkAuth();
          const claims = parseJwtPayload(token);
          const profile = await fetchProfileSummarySafe();
          const user = makeUserFromCheckAuth(data.user, profile, claims);
          const profileCompleted = user.role === 'admin' || computeProfileCompleted(profile);
          const isVendor = Boolean(claims?.isVendor);
          const vendorId = (claims?.vendorId ?? data.user.vendorId ?? null) as string | null;
          set({
            user,
            isAuthenticated: true,
            authReady: true,
            isVendor,
            vendorId,
            profileCompleted,
          });
        } catch {
          setAccessToken(null);
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            authReady: true,
            isVendor: false,
            vendorId: null,
            profileCompleted: false,
          });
        }
      },
    }),
    {
      name: 'vendex-auth',
      partialize: (s) => ({ token: s.token }),
    }
  )
);
