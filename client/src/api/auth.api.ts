import { apiClient } from '@/lib/api-client';
import { GATEWAY } from '@/lib/gateway-paths';

const base = `${GATEWAY.auth}/user`;

export interface LoginBody {
  email: string;
  password: string;
}

export interface SignupBody {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  profile_picture?: string;
}

export interface AuthUserDto {
  _id: string;
  email: string;
  full_name: string;
  phone?: string;
  profile_picture?: string;
}

export interface LoginResponse {
  message: string;
  user: AuthUserDto;
  token: string;
}

export interface RegisterBody {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface RegisterResponse {
  success?: boolean;
  message: string;
  user: AuthUserDto;
  token: string;
  accessToken?: string;
}

export interface CheckAuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    vendorId?: string | null;
  };
}

export const authApi = {
  login: (body: LoginBody) =>
    apiClient.post<LoginResponse>(`${base}/login`, body, { skipAuth: true }),

  signup: (body: SignupBody) =>
    apiClient.post<RegisterResponse>(`${base}/signup`, body, { skipAuth: true }),

  logout: () => apiClient.post<{ message: string }>(`${base}/logout`),

  checkAuth: () => apiClient.post<CheckAuthResponse>(`${base}/check-auth`),
};
