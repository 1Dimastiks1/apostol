import { WifiOff } from 'lucide-react'
import { useOnline } from '@/lib/outbox'
import { turnstileOn } from '@/components/ui/turnstile'

/** Пояснення над формою, коли немає інтернету */
export function OfflineNotice({ what }: { what: 'заявку' | 'записку' }) {
  const online = useOnline()
  if (online) return null
  return (
    <div role="status" className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-400/60 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
      <WifiOff className="mt-0.5 size-5 shrink-0" />
      <p>
        <b>Немає інтернету.</b>{' '}
        {turnstileOn
          ? `Поки зв’язку немає, надіслати ${what} не вийде, і адміністратор її не побачить. Заповніть форму: щойно інтернет з’явиться, натисніть «Надіслати».`
          : `Адміністратор побачить ${what} лише коли ви знову будете в мережі. Заповніть форму й натисніть «Надіслати»: ${what === 'заявку' ? 'заявка' : 'записка'} збережеться на цьому пристрої й сама надійде, щойно з’явиться інтернет.`}
      </p>
    </div>
  )
}
