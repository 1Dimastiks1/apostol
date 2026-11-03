import { useCallback, useState, type FormEvent } from 'react'
import { Loader2, Plus, X } from 'lucide-react'
import { Toast, type ToastMessage } from '@/components/ui/toast'
import { Turnstile, turnstileOn } from '@/components/ui/turnstile'
import { MetalButton } from '@/components/ui/liquid-glass-button'
import { PHONE_LABEL, photo } from '@/lib/parish'
import { cn } from '@/lib/utils'
import { OfflineError, submitOrQueue } from '@/lib/outbox'
import { OfflineNotice } from './offline-notice'
import { SectionHeading } from './section-heading'

type NoteType = 'health' | 'repose'
const capitalize = (v: string) => v.replace(/^\s*\p{L}/u, (l) => l.toLocaleUpperCase('uk-UA'))

export function Memorial() {
  const [type, setType] = useState<NoteType>('health')
  const [names, setNames] = useState<string[]>([''])
  const [consent, setConsent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [captcha, setCaptcha] = useState<string | null>(null)
  const [captchaReset, setCaptchaReset] = useState(0)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const closeToast = useCallback(() => setToast(null), [])
  const living = type === 'health'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const list = names.map((n) => n.trim()).filter(Boolean)
    if (!list.length) return setError('Додайте принаймні одне хрещене ім’я.')
    if (!consent) return setError('Поставте галочку, щоб підтвердити передачу імен парафії.')
    if (turnstileOn && !captcha && navigator.onLine) return setError('Зачекайте секунду, поки завершиться перевірка «я не робот», і спробуйте ще раз.')
    setError('')
    setSending(true)
    try {
      const result = await submitOrQueue('notes', { kind: type, names: list, consent, website: honeypot, turnstile: captcha }, !turnstileOn)
      setToast(result === 'sent'
        ? { kind: 'success', title: 'Записку надіслано', text: 'Імена передано парафії для поминання. Нехай береже вас Господь!' }
        : { kind: 'success', title: 'Записку збережено', text: 'Інтернету зараз немає. Записка збережена на вашому пристрої й автоматично надійде парафії, щойно зв’язок з’явиться. Адміністратор побачить її лише після цього.' })
      setNames([''])
      setConsent(false)
      setCaptchaReset((n) => n + 1)
    } catch (err) {
      if (err instanceof OfflineError) {
        setToast({ kind: 'error', title: 'Немає інтернету', text: 'Записку не надіслано, адміністратор її не бачить. Імена у формі збережені: натисніть «Надіслати», коли зв’язок з’явиться.' })
        return
      }
      setToast({ kind: 'error', title: 'Не вдалося надіслати', text: `${err instanceof Error ? err.message : 'Помилка мережі'}. Спробуйте ще раз або зателефонуйте: ${PHONE_LABEL}.` })
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="prayer-notes" className="grain relative isolate overflow-hidden bg-night py-28 text-ivory sm:py-36">
      <Toast message={toast} onClose={closeToast} />
      <img src={photo('parish/analoy-gospel.jpg')} alt="" className="absolute inset-0 -z-10 size-full object-cover opacity-25" loading="lazy" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night via-night/90 to-night/60" />
      <div className="shell grid gap-16 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-24">
        <div>
          <SectionHeading dark index="09" eyebrow="Молитовне поминання" title={<>Подати <em className="gold-text">записку</em></>} />
          <div className="reveal mt-8 max-w-lg space-y-4 leading-relaxed text-ivory/70">
            <p>Впишіть хрещені імена, і записку одразу буде передано парафії для поминання на богослужінні.</p>
            <p>Імена для церковного поминання пишуть у родовому відмінку. Перша літера автоматично стає великою.</p>
            <p className="text-sm text-gold-light/80">Імена бачать лише адміністратори парафії й ніде не публікуються.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate className={cn('reveal relative rounded-[2rem] p-8 text-ink shadow-2xl transition-colors duration-500 sm:p-11', living ? 'bg-[#fbf6ec]' : 'bg-[#eef2f7]')}>
          <div className="absolute inset-3 rounded-[1.6rem] border pointer-events-none transition-colors duration-500" style={{ borderColor: living ? 'rgba(138,106,42,.45)' : 'rgba(24,53,83,.35)' }} aria-hidden="true" />
          <div className="relative">
            <div className="flex gap-2" role="tablist" aria-label="Тип поминання">
              {(['health', 'repose'] as const).map((t) => (
                <button key={t} type="button" role="tab" aria-selected={type === t} onClick={() => setType(t)} className={cn('chip', t === 'repose' && type === t && '!border-[#183553] !bg-[#183553]')}>
                  {t === 'health' ? 'За здоров’я' : 'За упокій'}
                </button>
              ))}
            </div>
            <div className="mt-8 text-center">
              <p className="text-2xl" aria-hidden="true" style={{ color: living ? '#5a1418' : '#183553' }}>✠</p>
              <h3 className="display mt-2 text-4xl" style={{ color: living ? '#5a1418' : '#183553' }}>{living ? 'Диптих Живих' : 'Диптих Спочилих'}</h3>
              <p className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-muted-foreground">Петропавлівський храм</p>
            </div>
            <label className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">Сайт<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} /></label>
            <div className="mt-8 space-y-3">
              {names.map((name, i) => (
                <div key={i} className="flex items-center gap-3">
                  <label className="sr-only" htmlFor={`name-${i}`}>Хрещене ім’я</label>
                  <input id={`name-${i}`} value={name} maxLength={80} autoComplete="off" placeholder="Хрещене ім’я у родовому відмінку" onChange={(e) => setNames(names.map((n, j) => (j === i ? capitalize(e.target.value) : n)))} className="w-full border-0 border-b border-dashed border-ink/25 bg-transparent px-1 py-3 font-display text-xl outline-none placeholder:font-sans placeholder:text-sm placeholder:text-ink/40 focus:border-solid focus:border-gold" />
                  {names.length > 1 && <button type="button" aria-label="Видалити ім’я" onClick={() => setNames(names.filter((_, j) => j !== i))} className="grid size-9 shrink-0 place-items-center rounded-full text-ink/50 hover:bg-ink/5"><X className="size-4" /></button>}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setNames([...names, ''])} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"><Plus className="size-4" />Додати ім’я</button>
            <label className="mt-8 flex items-start gap-3 text-sm text-ink/70">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[#5a1418]" />
              Погоджуюся передати ці імена парафії для церковного поминання.
            </label>
            <OfflineNotice what="записку" />
            <div className="mt-6"><Turnstile onToken={setCaptcha} resetKey={captchaReset} /></div>
            <div className="mt-8"><MetalButton variant={living ? 'bronze' : 'default'} type="submit" disabled={sending}><span className="inline-flex items-center gap-2">{sending && <Loader2 className="size-4 animate-spin" />}{sending ? 'Надсилаємо…' : 'Надіслати записку'}</span></MetalButton></div>
            {error && <p role="alert" className="mt-5 text-sm font-semibold text-red-700">{error}</p>}
          </div>
        </form>
      </div>
    </section>
  )
}
