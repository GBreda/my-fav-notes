import type {
  CreateItemInput,
  Item,
  ItemListResponse,
  LoginInput,
  PublicUser,
  RegisterInput,
  Status,
  Category,
} from '@depois/shared';

export class ApiError extends Error {
  status: number;
  code: string;
  issues?: { path: string; code: string }[];

  constructor(status: number, code: string, issues?: { path: string; code: string }[]) {
    super(code);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.issues = issues;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers: {
        ...(init?.body ? { 'content-type': 'application/json' } : {}),
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
      credentials: 'include',
    });
  } catch {
    throw new ApiError(0, 'NETWORK');
  }

  const body = (await response.json().catch(() => ({}))) as {
    code?: string;
    issues?: { path: string; code: string }[];
  };
  if (!response.ok) {
    throw new ApiError(response.status, body.code || 'GENERIC', body.issues);
  }
  return body as T;
}

export type ListQuery = {
  category?: Category;
  status?: Status;
  q?: string;
};

export const api = {
  register: (input: RegisterInput) =>
    request<{ user: PublicUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  login: (input: LoginInput) =>
    request<{ user: PublicUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  logout: () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
  me: () => request<PublicUser>('/api/auth/me'),
  listItems: (query: ListQuery) => {
    const params = new URLSearchParams();
    if (query.category) params.set('category', query.category);
    if (query.status) params.set('status', query.status);
    if (query.q) params.set('q', query.q);
    const suffix = params.size ? `?${params.toString()}` : '';
    return request<ItemListResponse>(`/api/items${suffix}`);
  },
  createItem: (input: CreateItemInput) =>
    request<Item>('/api/items', { method: 'POST', body: JSON.stringify(input) }),
  updateItem: (id: string, input: CreateItemInput) =>
    request<Item>(`/api/items/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  setSeen: (id: string, seen: boolean) =>
    request<Item>(`/api/items/${id}/seen`, { method: 'PATCH', body: JSON.stringify({ seen }) }),
  removeItem: (id: string) => request<{ ok: boolean }>(`/api/items/${id}`, { method: 'DELETE' }),
};
