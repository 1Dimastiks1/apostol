import { useEffect, useState } from 'react'

/**
 * Надсилання форм із підтримкою «без інтернету»: якщо зв'язку немає, заявка чи записка зберігається
 * на пристрої й сама надсилається, щойно інтернет з'явиться. Дані лежать лише на телефоні відвідувача
 * до відправки й після неї видаляються.
 */
export type Endpoint = 'requests' | 'notes'
type Item = { id: string; endpoint: Endpoint; body: Record<string, unknown>; createdAt: number }

const KEY = 'parish-outbox'
const MAX_AGE = 7 * 24 * 3600 * 1000 // тиждень: старі невідправлені записи видаляємо
const SENT_EVENT = 'parish-outbox-sent'

const read = (): Item[] => {
  try { return (JSON.parse(localStorage.getItem(KEY) || '[]') as Item[]).filter((i) => Date.now() - i.createdAt < MAX_AGE) } catch { return [] }
}
const write = (items: Item[]) => { try { localStorage.setItem(KEY, JSON.stringify(items)) } catch { /* сховище недоступне */ } }

export class SubmitError extends Error {
  constructor(message: string, readonly fields?: Record<string, string>) { super(message) }
}
/** Зв'язку немає, а зберегти для пізнішої відправки не можна (наприклад, увімкнена перевірка «я не робот») */
export class OfflineError extends Error {}

const post = (endpoint: Endpoint, body: Record<string, unknown>) =>
  fetch(new URL(`api/${endpoint}`, document.baseURI), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

function enqueue(endpoint: Endpoint, body: Record<string, unknown>) {
  const { turnstile: _drop, ...rest } = body // токен перевірки живе кілька хвилин і не годиться для відкладеної відправки
  write([...read(), { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, endpoint, body: rest, createdAt: Date.now() }])
}

/** Надсилає форму. Без зв'язку: зберігає в чергу (якщо allowQueue) і повертає 'queued'. */
export async function submitOrQueue(endpoint: Endpoint, body: Record<string, unknown>, allowQueue: boolean): Promise<'sent' | 'queued'> {
  if (!navigator.onLine) {
    if (!allowQueue) throw new OfflineError()
    enqueue(endpoint, body)
    return 'queued'
  }
  let res: Response
  try { res = await post(endpoint, body) } catch {
    if (!allowQueue) throw new OfflineError()
    enqueue(endpoint, body)
    return 'queued'
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.success) throw new SubmitError(data.fields?.names || data.error || 'Не вдалося надіслати', data.fields)
  return 'sent'
}

let flushing = false
/** Надсилає все, що накопичилось без інтернету. Повертає, скільки штук пішло. */
export async function flushOutbox(): Promise<number> {
  if (flushing || !navigator.onLine) return 0
  flushing = true
  let sent = 0
  try {
    for (const item of read()) {
      try {
        const res = await post(item.endpoint, item.body)
        if (res.ok) sent++
        else if (res.status >= 500 || res.status === 429) continue // тимчасова помилка: спробуємо пізніше
        write(read().filter((i) => i.id !== item.id)) // успіх або відмова сервера (некоректні дані): запис прибираємо
      } catch { break } // зв'язок знову зник
    }
  } finally { flushing = false }
  if (sent) window.dispatchEvent(new CustomEvent(SENT_EVENT, { detail: sent }))
  return sent
}

export const onOutboxSent = (cb: (count: number) => void) => {
  const handler = (e: Event) => cb((e as CustomEvent<number>).detail)
  window.addEventListener(SENT_EVENT, handler)
  return () => window.removeEventListener(SENT_EVENT, handler)
}

export const pendingCount = () => read().length

/** Чи є зараз інтернет (оновлюється, коли він зникає чи з'являється) */
export function useOnline() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  return online
}
