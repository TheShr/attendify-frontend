// lib/api.ts

const DEFAULT_API_BASE = 'http://localhost:5000/api'

// Read the public API base from Next.js env (set in Vercel & .env.local)
function getNextEnv(): string | undefined {
  if (typeof process === 'undefined') return undefined
  const value = process.env.NEXT_PUBLIC_API_URL
  return typeof value === 'string' ? value : undefined
}

/**
 * Decide the API base.
 * In Vercel/production: set NEXT_PUBLIC_API_URL = https://your-render.onrender.com/api
 * In local dev: falls back to http://localhost:5000/api
 */
export function getApiBase(): string {
  const candidate = getNextEnv()
  if (candidate && candidate.trim().length > 0) {
    return candidate.trim().replace(/\/$/, '')
  }
  return DEFAULT_API_BASE
}

/**
 * Resolve a relative or absolute path against the API base.
 * - Avoids double "/api" when NEXT_PUBLIC_API_URL already ends with /api.
 * - Leaves absolute URLs (http/https) untouched.
 */
export function resolveApiUrl(path: string): string {
  const base = getApiBase()

  // Absolute URL? return as-is
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  let relative = path.startsWith('/') ? path : `/${path}`
  const trimmedBase = base.replace(/\/+$/, '')
  const baseHasApi = trimmedBase.endsWith('/api')

  // If base already ends with /api and caller passes /api/... strip one side
  if (baseHasApi && relative.startsWith('/api/')) {
    relative = relative.slice(4) // remove leading "/api"
  } else if (baseHasApi && relative === '/api') {
    relative = '' // avoid trailing duplicate
  }

  return `${trimmedBase}${relative}`
}

/**
 * Low-level fetch that resolves API URL.
 */
export async function apiFetch(path: string, init?: RequestInit) {
  return fetch(resolveApiUrl(path), init)
}

/**
 * JSON helper:
 * - Ensures Content-Type: application/json by default
 * - Throws on non-2xx with response text
 * - Parses JSON body to type T
 */
export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers || {})
  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }

  const response = await apiFetch(path, { ...init, headers })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Request failed with ${response.status}: ${text}`)
  }

  // Some endpoints might return 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T
  }

  return (await response.json()) as T
}
