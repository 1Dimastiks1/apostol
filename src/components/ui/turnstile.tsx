import { useEffect, useRef } from 'react'

const SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined)?.trim()
const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

type TurnstileApi = { render: (el: HTMLElement, opts: Record<string, unknown>) => string; reset: (id?: string) => void; remove: (id?: string) => void }
declare global { interface Window { turnstile?: TurnstileApi } }

/** Чи ввімкнена капча на цій збірці (задано VITE_TURNSTILE_SITE_KEY) */
export const turnstileOn = Boolean(SITE_KEY)

let loading: Promise<void> | null = null
const loadScript = () => (loading ??= new Promise<void>((resolve, reject) => {
  if (window.turnstile) return resolve()
  const s = document.createElement('script')
  s.src = SCRIPT
  s.async = true
  s.onload = () => resolve()
  s.onerror = () => { loading = null; reject(new Error('turnstile')) }
  document.head.appendChild(s)
}))

/** Невидима для людини перевірка Cloudflare Turnstile. `resetKey` змінюється після відправки, щоб отримати новий токен. */
export function Turnstile({ onToken, resetKey = 0 }: { onToken: (token: string | null) => void; resetKey?: number }) {
  const box = useRef<HTMLDivElement>(null)
  const widget = useRef<string | null>(null)
  const cb = useRef(onToken)
  cb.current = onToken

  useEffect(() => {
    if (!SITE_KEY) return
    let cancelled = false
    loadScript().then(() => {
      if (cancelled || !box.current || !window.turnstile) return
      widget.current = window.turnstile.render(box.current, {
        sitekey: SITE_KEY,
        language: 'uk',
        theme: 'auto',
        callback: (t: string) => cb.current(t),
        'expired-callback': () => cb.current(null),
        'error-callback': () => cb.current(null),
      })
    }).catch(() => cb.current(null))
    return () => {
      cancelled = true
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current)
      widget.current = null
    }
  }, [])

  useEffect(() => {
    if (resetKey && widget.current && window.turnstile) { cb.current(null); window.turnstile.reset(widget.current) }
  }, [resetKey])

  return SITE_KEY ? <div ref={box} className="min-h-[65px]" /> : null
}
