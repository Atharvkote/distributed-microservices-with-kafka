export interface JwtPayloadShape {
  sub?: string;
  email?: string;
  full_name?: string;
  isVendor?: boolean;
  vendorId?: string | null;
  exp?: number;
  iat?: number;
}

export function parseJwtPayload(token: string): JwtPayloadShape | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as JwtPayloadShape;
  } catch {
    return null;
  }
}
