export type Role = 'admin' | 'forms'

const TOKEN_KEY = 'parish-admin-token'

export const session = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } },
  set: (token: string | null) => {
    try { token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY) } catch { /* приватний режим */ }
  },
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number) { super(message) }
}

/** Запит до API адмінки з токеном. 401 → сесію скинуто. */
export async function api<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const token = session.get()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.json !== undefined) headers.set('Content-Type', 'application/json')
  const res = await fetch(new URL(`api/${path}`, document.baseURI), {
    ...init,
    headers,
    cache: 'no-store',
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || (data && data.success === false)) {
    if (res.status === 401) session.set(null)
    throw new ApiError(data?.error || `Помилка сервера (${res.status})`, res.status)
  }
  return data as T
}

export type Stream = {
  id: string
  title: string
  videoUrl: string
  description?: string
  date?: string
  dateLabel?: string
  isLive?: boolean
  isPrimary?: boolean
  createdAt?: string
  updatedAt?: string
}

export type ParishEvent = {
  id: string
  title: string
  date: string
  description?: string
  link?: string
  hasImage?: boolean
  imageUpdatedAt?: string
  imageUrl?: string
  createdAt?: string
}

export type ParishRequest = {
  id: string
  type: string
  name: string
  phone: string
  date?: string
  intention?: string
  status: 'new' | 'done'
  createdAt: string
  updatedAt?: string
}

export type ParishNote = {
  id: string
  kind: 'health' | 'repose'
  names: string[]
  status: 'new' | 'done'
  createdAt: string
  updatedAt?: string
}

const dt = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const d = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })

export const formatDateTime = (value?: string) => {
  const t = Date.parse(value || '')
  return Number.isFinite(t) ? dt.format(new Date(t)) : (value || '—')
}
export const formatDay = (value?: string) => {
  const t = Date.parse(value ? `${value}T12:00:00` : '')
  return Number.isFinite(t) ? d.format(new Date(t)) : (value || '—')
}

/** ISO → значення для <input type="datetime-local"> */
export const toLocalInput = (value?: string) => {
  const t = Date.parse(value || '')
  if (!Number.isFinite(t)) return ''
  const date = new Date(t)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
export const fromLocalInput = (value: string) => (value ? new Date(value).toISOString() : '')
