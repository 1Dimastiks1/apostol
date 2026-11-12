import { useState, type ReactNode } from 'react'
import { Cookie, MapPin, Play } from 'lucide-react'
import { setConsent, useConsent } from '@/lib/consent'
import { cn } from '@/lib/utils'

const policy = `${import.meta.env.BASE_URL}privacy`

/** Банер згоди внизу екрана: показується, доки людина не обере варіант */
export function ConsentBanner() {
  const consent = useConsent()
  if (consent) return null
  return (
    <div role="dialog" aria-live="polite" aria-label="Згода на сторонній вміст" className="fixed inset-x-3 z-[60] mx-auto max-w-2xl rounded-3xl border border-gold/30 bg-night/95 p-5 text-ivory shadow-2xl backdrop-blur-xl sm:p-6 xl:bottom-6" style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}>
      <div className="flex items-start gap-4">
        <span className="hidden size-11 shrink-0 place-items-center rounded-full border border-gold/40 text-gold-light sm:grid"><Cookie className="size-5" /></span>
        <div className="min-w-0">
          <p className="font-display text-xl">Відео та карта на сайті</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ivory/70">
            Трансляції з Facebook і карта Google можуть зберігати свої cookie. Власних рекламних чи стежувальних cookie сайт не використовує. <a href={policy} className="text-gold-light underline underline-offset-4">Детальніше</a>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => setConsent('all')} className="min-h-11 rounded-full bg-gradient-to-b from-[#f3dfa0] to-[#a8853c] px-5 text-sm font-bold text-night">Дозволити</button>
            <button type="button" onClick={() => setConsent('necessary')} className="min-h-11 rounded-full border border-white/20 px-5 text-sm font-semibold text-ivory/80 hover:border-gold">Лише необхідне</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Сторонній вміст показується лише після згоди; до того заглушка з кнопкою «Показати» */
export function EmbedGate({ provider, children, className, dark = true }: { provider: 'Facebook' | 'YouTube' | 'Google Maps'; children: ReactNode; className?: string; dark?: boolean }) {
  const consent = useConsent()
  const [once, setOnce] = useState(false)
  if (consent === 'all' || once) return <>{children}</>
  const Icon = provider === 'Google Maps' ? MapPin : Play
  return (
    <div className={cn('grid size-full place-items-center p-6 text-center', dark ? 'bg-wine-deep text-ivory' : 'bg-parchment text-ink', className)}>
      <div className="max-w-xs">
        <span className="mx-auto grid size-14 place-items-center rounded-full border border-gold/50 text-gold-light"><Icon className="size-6" /></span>
        <p className={cn('mt-4 text-sm leading-relaxed', dark ? 'text-ivory/70' : 'text-muted-foreground')}>{provider === 'Google Maps' ? 'Карта' : 'Відео'} завантажується з сервісу {provider}, який може зберігати cookie.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => setOnce(true)} className="min-h-11 rounded-full bg-gradient-to-b from-[#f3dfa0] to-[#a8853c] px-5 text-sm font-bold text-night">Показати</button>
          <button type="button" onClick={() => setConsent('all')} className={cn('min-h-11 rounded-full border px-5 text-sm font-semibold', dark ? 'border-white/20 text-ivory/80' : 'border-border text-ink')}>Дозволяти завжди</button>
        </div>
      </div>
    </div>
  )
}
