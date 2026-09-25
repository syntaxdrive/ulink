/**
 * NestJS API Client
 * Replaces all direct Supabase data calls.
 * URL is set via VITE_API_URL env var in Cloudflare Pages.
 */

const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://unilink-api.onrender.com/api/v1';

function getToken(): string | null {
  return localStorage.getItem('ulink_jwt_token');
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      return { data: null, error: err.message || 'Request failed' };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (e: any) {
    return { data: null, error: e.message || 'Network error' };
  }
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

export type { };
