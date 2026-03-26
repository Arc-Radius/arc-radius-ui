export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export interface ApiClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  getAuthToken?: () => string | null | Promise<string | null>;
}

const DEFAULT_TIMEOUT_MS = 12_000;

function resolveBaseUrl() {
  return process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
}

async function withTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const externalSignal = init.signal;

  const abortFromExternal = () => controller.abort();
  externalSignal?.addEventListener('abort', abortFromExternal);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(`Request timed out after ${timeoutMs}ms`, 408, null);
    }
    throw error;
  } finally {
    externalSignal?.removeEventListener('abort', abortFromExternal);
    clearTimeout(timer);
  }
}

async function parseBody(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = options.baseUrl ?? resolveBaseUrl();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await options.getAuthToken?.();
    const headers = new Headers(init.headers ?? {});
    if (!headers.has('accept')) headers.set('accept', 'application/json');
    if (!headers.has('content-type') && init.body != null) headers.set('content-type', 'application/json');
    if (token) headers.set('authorization', `Bearer ${token}`);

    const response = await withTimeout(`${baseUrl}${path}`, { ...init, headers }, timeoutMs);
    const body = await parseBody(response);
    if (!response.ok) {
      throw new ApiError(
        `Request failed (${response.status}) ${response.statusText}`,
        response.status,
        body
      );
    }

    return body as T;
  }

  return {
    get<T>(path: string, init?: RequestInit) {
      return request<T>(path, { ...init, method: 'GET' });
    },
    post<T>(path: string, body?: unknown, init?: RequestInit) {
      return request<T>(path, {
        ...init,
        method: 'POST',
        body: body == null ? undefined : JSON.stringify(body),
      });
    },
  };
}

export const apiClient = createApiClient();
