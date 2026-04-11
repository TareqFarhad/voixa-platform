'use client';

export interface VoixaUser {
  id: string;
  email: string;
  name?: string | null;
  plan: string;
}

export interface VoixaSession {
  accessToken: string;
  user: VoixaUser;
}

const STORAGE_KEY = 'voixa.session';

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
}

export function readSession(): VoixaSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as VoixaSession) : null;
  } catch {
    return null;
  }
}

export function writeSession(session: VoixaSession | null): void {
  if (typeof window === 'undefined') return;
  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string | null;
  signal?: AbortSignal;
  formData?: FormData;
}

export class VoixaApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const base = getBaseUrl().replace(/\/$/, '');
  const url = `${base}/api${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers ?? {}),
  };
  if (!options.formData && options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  const token = options.token ?? readSession()?.accessToken;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: options.method ?? (options.body || options.formData ? 'POST' : 'GET'),
    headers,
    body: options.formData
      ? options.formData
      : options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
    signal: options.signal,
    cache: 'no-store',
  });

  const text = await response.text();
  const payload = text ? safeJson(text) : null;
  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && 'message' in payload && String((payload as any).message)) ||
      `Request failed with ${response.status}`;
    throw new VoixaApiError(message, response.status, payload);
  }
  return payload as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const auth = {
  register: (email: string, password: string, name?: string) =>
    apiRequest<VoixaSession>('/auth/register', { body: { email, password, name } }),
  login: (email: string, password: string) =>
    apiRequest<VoixaSession>('/auth/login', { body: { email, password } }),
  logout: () => apiRequest<{ ok: true }>('/auth/logout', { method: 'POST' }),
  me: () => apiRequest<VoixaUser & { profile?: unknown; voiceProfile?: unknown }>('/auth/me'),
  requestReset: (email: string) =>
    apiRequest<{ ok: true }>('/auth/reset-password', { body: { email } }),
};

export interface VoixaAsset {
  id: string;
  type: string;
  storageKey: string;
  format?: string | null;
  sizeBytes?: number | null;
  durationMs?: number | null;
}

export interface VoixaProject {
  id: string;
  userId: string;
  title: string;
  songTitle?: string | null;
  genre?: string | null;
  style?: string | null;
  lyrics?: string | null;
  status: string;
  settings?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  assets?: VoixaAsset[];
  jobs?: Array<{ id: string; status: string; stage?: string | null; progress: number }>;
}

export const projects = {
  list: () => apiRequest<VoixaProject[]>('/projects'),
  create: (data: {
    title: string;
    songTitle?: string;
    genre?: string;
    style?: string;
    lyrics?: string;
  }) => apiRequest<VoixaProject>('/projects', { body: data }),
  get: (id: string) => apiRequest<VoixaProject>(`/projects/${id}`),
  update: (id: string, data: Partial<VoixaProject> & { settings?: Record<string, unknown> }) =>
    apiRequest<VoixaProject>(`/projects/${id}`, { method: 'PUT', body: data }),
  remove: (id: string) => apiRequest<{ ok: true }>(`/projects/${id}`, { method: 'DELETE' }),
};

export const uploads = {
  vocal: (projectId: string, file: File) => uploadFile(`/uploads/vocal/${projectId}`, file),
  instrumental: (projectId: string, file: File) =>
    uploadFile(`/uploads/instrumental/${projectId}`, file),
};

async function uploadFile(path: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  return apiRequest<VoixaAsset>(path, { formData: form });
}

export const processing = {
  start: (projectId: string, settings?: Record<string, unknown>) =>
    apiRequest<{ jobId: string; projectId: string; status: string }>('/processing/start', {
      body: { projectId, settings },
    }),
  status: (jobId: string) =>
    apiRequest<{
      jobId: string;
      projectId: string;
      status: string;
      stage?: string | null;
      progress: number;
      errorMessage?: string | null;
      assets: Array<{ id: string; type: string; storageKey: string }>;
    }>(`/processing/status/${jobId}`),
  retry: (jobId: string) =>
    apiRequest<{ jobId: string; projectId: string; status: string }>(`/processing/retry/${jobId}`, {
      method: 'POST',
    }),
};

export const exportsApi = {
  get: (projectId: string) =>
    apiRequest<{ projectId: string; title: string; url: string; format?: string | null }>(
      `/exports/${projectId}`,
    ),
};

export const profileApi = {
  get: () => apiRequest<any>('/profile'),
  update: (data: {
    displayName?: string;
    consentVoiceProcessing?: boolean;
    consentMarketing?: boolean;
  }) => apiRequest<any>('/profile', { method: 'PUT', body: data }),
  deleteVoiceModel: () =>
    apiRequest<{ ok: true }>('/profile/voice-model', { method: 'DELETE' }),
};

export function storageUrl(key: string): string {
  if (!key) return '';
  if (key.startsWith('http')) return key;
  const base = getBaseUrl().replace(/\/$/, '');
  return `${base}/api/storage/${key}`;
}
