/**
 * NestJS API Client
 * Replaces all direct Supabase data calls.
 * Auto-detects localhost vs production Render URL.
 */

function getBaseUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) return envUrl;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:3000/api/v1';
  }
  return 'https://unilink-api.onrender.com/api/v1';
}

function getToken(): string | null {
  try {
    return localStorage.getItem('ulink_jwt_token');
  } catch {
    return null;
  }
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout max

    const res = await fetch(`${getBaseUrl()}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

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
