import { useEffect, useState } from 'react'

/**
 * Згода на сторонній вміст (відео Facebook/YouTube, карта Google): ці сервіси можуть ставити свої cookie,
 * тому до згоди замість них показується заглушка. Власних рекламних чи трекінгових cookie сайт не ставить.
 */
export type Consent = 'all' | 'necessary' | null
const KEY = 'parish-consent'
const EVENT = 'parish-consent-change'

export const readConsent = (): Consent => {
  try { const v = localStorage.getItem(KEY); return v === 'all' || v === 'necessary' ? v : null } catch { return null }
}
export function setConsent(value: Exclude<Consent, null>) {
  try { localStorage.setItem(KEY, value) } catch { /* приватний режим: діє до перезавантаження */ }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }))
}

export function useConsent() {
  const [consent, set] = useState<Consent>(() => (typeof window === 'undefined' ? null : readConsent()))
  useEffect(() => {
    const onChange = (e: Event) => set((e as CustomEvent<Consent>).detail)
    window.addEventListener(EVENT, onChange)
    return () => window.removeEventListener(EVENT, onChange)
  }, [])
  return consent
}
