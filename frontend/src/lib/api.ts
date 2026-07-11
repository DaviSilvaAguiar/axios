import { cookieClient } from './cookies';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';


type ApiOptions = RequestInit & {
  next?: { revalidate?: number | false; tags?: string[] };
};

function isServer(): boolean {
  return typeof window === 'undefined';
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  if (isServer()) {
    const { cookies } = await import('next/headers');
    const jar = await cookies();
    return buildAuthHeaders(jar.get('axios_token')?.value, jar.get('axios_tenant')?.value);
  }
  return buildAuthHeaders(cookieClient.getToken(), cookieClient.getTenant());
}

function buildAuthHeaders(token?: string | null, tenant?: string | null): Record<string, string> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (tenant) headers['X-Account'] = tenant;
  return headers;
}

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const auth = await getAuthHeaders();
  const { next, headers, ...rest } = options;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...auth,
      ...(headers as Record<string, string>),
    },
    ...(next ? { next } : {}),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro inesperado.' }));
    const body = error as { message?: string; errors?: Record<string, string[]> };
    const firstError = body.errors ? Object.values(body.errors)[0]?.[0] : undefined;
    throw new Error(firstError ?? body.message ?? 'Erro inesperado.');
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function apiFetchUpload<T>(path: string, body: FormData): Promise<T> {
  const auth = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { Accept: 'application/json', ...auth },
    body,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro inesperado.' }));
    const body = error as { message?: string; errors?: Record<string, string[]> };
    const firstError = body.errors ? Object.values(body.errors)[0]?.[0] : undefined;
    throw new Error(firstError ?? body.message ?? 'Erro inesperado.');
  }

  return response.json() as Promise<T>;
}

async function apiFetchBlob(path: string): Promise<Blob> {
  const auth = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: 'application/octet-stream', ...auth },
  });

  if (!response.ok) throw new Error('Falha ao baixar arquivo.');
  return response.blob();
}

export const api = {
  get: <T>(path: string, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(path: string, options?: ApiOptions) =>
    apiFetch<T>(path, { ...options, method: 'DELETE' }),

  upload: <T>(path: string, body: FormData) =>
    apiFetchUpload<T>(path, body),

  blob: (path: string) =>
    apiFetchBlob(path),
};
