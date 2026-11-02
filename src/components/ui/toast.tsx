import { useEffect } from 'react'
import { CircleAlert, CircleCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastMessage = { kind: 'success' | 'error'; title: string; text?: string }

/** Сповіщення вгорі екрана: зелена галочка — успіх, червоний знак — помилка */
export function Toast({ message, onClose, duration = 7000 }: { message: ToastMessage | null; onClose: () => void; duration?: number }) {
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(onClose, duration)
    return () => window.clearTimeout(timer)
  }, [message, onClose, duration])

  if (!message) return null
  const ok = message.kind === 'success'
  const Icon = ok ? CircleCheck : CircleAlert
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[120] flex justify-center px-4" role={ok ? 'status' : 'alert'} aria-live={ok ? 'polite' : 'assertive'}>
      <div className={cn(
        'pointer-events-auto flex w-full max-w-md items-start gap-4 rounded-2xl border p-5 shadow-[0_30px_70px_-25px_rgba(0,0,0,.55)] backdrop-blur-xl animate-[toast-in_.45s_cubic-bezier(.2,.8,.2,1)_both]',
        ok ? 'border-emerald-300/60 bg-emerald-50/95 text-emerald-950' : 'border-red-300/60 bg-red-50/95 text-red-950',
      )}>
        <span className={cn('grid size-10 shrink-0 place-items-center rounded-full', ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white')}>
          <Icon className="size-5" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="font-display text-xl font-semibold leading-tight">{message.title}</p>
          {message.text && <p className="mt-1 text-sm leading-relaxed opacity-80">{message.text}</p>}
        </div>
        <button type="button" onClick={onClose} aria-label="Закрити сповіщення" className="grid size-8 shrink-0 place-items-center rounded-full opacity-60 hover:bg-black/5 hover:opacity-100"><X className="size-4" /></button>
      </div>
    </div>
  )
}
