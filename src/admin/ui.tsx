import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const btn = {
  primary: 'inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-110 disabled:opacity-50',
  ghost: 'inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-semibold text-ink transition hover:border-gold disabled:opacity-50',
  danger: 'inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50',
  live: 'inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-3.5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50',
}

export function Modal({ title, open, onClose, children, footer, wide }: { title: string; open: boolean; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  // onClose зазвичай нова функція на кожен рендер: тримаємо її в ref, щоб ефект (і фокус) не спрацьовував при кожному символі
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current()
    window.addEventListener('keydown', onKey)
    const body = ref.current?.querySelector<HTMLElement>('.overflow-y-auto')
    ;(body?.querySelector<HTMLElement>('input, textarea, select') ?? ref.current?.querySelector<HTMLElement>('button'))?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-night/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className={cn('flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl', wide ? 'sm:max-w-2xl' : 'sm:max-w-lg')}>
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-display text-2xl text-ink">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Закрити" className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"><X className="size-5" /></button>
        </div>
        <div className="overflow-y-auto px-6 py-6">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-border bg-parchment/40 px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-ink">
      {label}
      {children}
      {error ? <span className="text-xs font-semibold text-red-700">{error}</span> : hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  )
}

export function Toggle({ checked, onChange, label, tone = 'gold' }: { checked: boolean; onChange: (v: boolean) => void; label: string; tone?: 'gold' | 'red' }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex items-center gap-3 text-sm font-semibold text-ink">
      <span className={cn('relative h-6 w-11 rounded-full transition-colors', checked ? (tone === 'red' ? 'bg-red-600' : 'bg-gold-deep') : 'bg-muted')}>
        <span className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow transition-all', checked ? 'left-[1.375rem]' : 'left-0.5')} />
      </span>
      {label}
    </button>
  )
}

export function Empty({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-gold/40 bg-card/60 px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-parchment text-gold-deep">{icon}</span>
      <p className="mt-5 font-display text-2xl text-ink">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function PanelHeader({ title, lead, actions }: { title: string; lead: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="display text-4xl text-ink sm:text-5xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{lead}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
