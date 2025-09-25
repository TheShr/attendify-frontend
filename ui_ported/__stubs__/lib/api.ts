export class ApiError extends Error {
  status: number
  bodyText?: string

  constructor(message: string, status = 500, bodyText?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.bodyText = bodyText
  }
}

export function getApiBase(): string {
  return ''
}

export function resolveApiUrl(path: string): string {
  return path
}

export async function apiFetch(_path: string, _init?: RequestInit): Promise<Response> {
  throw new ApiError('apiFetch is a stub. This UI bundle is not wired to backend APIs.', 501)
}

export async function apiJson<T>(_path: string, _init?: RequestInit): Promise<T> {
  throw new ApiError('apiJson is a stub. This UI bundle is not wired to backend APIs.', 501)
}

export async function apiJsonBody<T>(_path: string, _body: unknown, _init?: RequestInit & { method?: 'POST' | 'PUT' | 'PATCH' }): Promise<T> {
  throw new ApiError('apiJsonBody is a stub. This UI bundle is not wired to backend APIs.', 501)
}
