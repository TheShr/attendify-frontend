// lib/api.ts

const DEFAULT_API_BASE = 'http://localhost:5000/api'

function getNextEnv(): string | undefined {
  // process is defined both on server and client in Next (envs are inlined at build)
  const value = process.env.NEXT_PUBLIC_API_URL
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export function getApiBase(): string {
  const candidate = getNextEnv()
  return (candidate ?? DEFAULT_API_BASE).replace(/\/$/, '')
}

export function resolveApiUrl(path: string): string {
  const base = getApiBase()

  if (/^https?:\/\//i.test(path)) {
    return path // already absolute
  }

  let relative = path.startsWith('/') ? path : `/${path}`
  const trimmedBase = base.replace(/\/+$/, '')
  const baseHasApi = trimmedBase.endsWith('/api')

  if (baseHasApi && relative.startsWith('/api/')) {
    relative = relative.slice(4) // drop leading /api
  } else if (baseHasApi && relative === '/api') {
    relative = ''
  }

  return `${trimmedBase}${relative}`
}

export async function apiFetch(path: string, init?: RequestInit) {
  return fetch(resolveApiUrl(path), init)
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Request failed with ${res.status}: ${text}`)
  }
  return (await res.json()) as T
}
