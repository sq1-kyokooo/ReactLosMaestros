import { API_BASE_URL } from '../config';

type AccessTokenProvider = () => Promise<string | undefined>;

let getAccessToken: AccessTokenProvider | null = null;

export function registerAccessTokenProvider(provider: AccessTokenProvider | null) {
  getAccessToken = provider;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  authenticated?: boolean;
}

export async function apiRequest<T>(path: string, { method = 'GET', body, authenticated = false }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const isMultipart = body instanceof FormData;
  if (body !== undefined && !isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (authenticated) {
    const accessToken = await getAccessToken?.();
    if (!accessToken) {
      throw new ApiError(401, 'Debes iniciar sesión.');
    }
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined || isMultipart ? (body as FormData | undefined) : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor.');
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

async function readErrorMessage(response: Response): Promise<string> {
  if (response.status === 401) return 'Debes iniciar sesión.';
  if (response.status === 403) return 'No tienes permisos para esta acción.';
  try {
    const body = await response.json();
    if (typeof body?.message === 'string') return body.message;
  } catch {
    // body was not JSON; fall through to the generic message
  }
  return `Error del servidor (${response.status}).`;
}

export function errorMessageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}
