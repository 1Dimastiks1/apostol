import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Check, Loader2, Phone } from 'lucide-react'
import { MetalButton } from '@/components/ui/liquid-glass-button'
import { Toast, type ToastMessage } from '@/components/ui/toast'
import { PHONE, PHONE_LABEL, photo } from '@/lib/parish'
import { REQUEST_TYPES, type FieldErrors, type RequestForm, formatLocalPhone, fullPhone, validateRequest } from '@/lib/request-validation'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'

const STEPS = [
  'Оберіть таїнство: Хрещення або Вінчання.',
  'Вкажіть ім’я, телефон і бажану дату.',
  'Надішліть заявку — парафія отримає її й передзвонить вам, щоб домовитися про деталі.',
]

const EMPTY: RequestForm = { type: 'baptism', name: '', phone: '', date: '', intention: '', consent: false }

const today = () => new Date().toISOString().slice(0, 10)

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return <p id={id} className="text-xs font-semibold text-red-700">{message}</p>
}

export function ServicesForm() {
  const [form, setForm] = useState<RequestForm>(EMPTY)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState(false)
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [honeypot, setHoneypot] = useState('')
  const closeToast = useCallback(() => setToast(null), [])

  const update = <K extends keyof RequestForm>(key: K, value: RequestForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // Після першої спроби надіслати підсвічуємо помилки одразу під час введення
  useEffect(() => {
    if (touched) setErrors(validateRequest(form))
  }, [form, touched])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTouched(true)
    const found = validateRequest(form)
    setErrors(found)
    if (Object.keys(found).length) {
      setToast({ kind: 'error', title: 'Перевірте форму', text: found.consent && Object.keys(found).length === 1 ? 'Поставте галочку, що дані вказано правильно — без неї заявка не надішлеться.' : 'Деякі поля заповнено неправильно. Їх позначено червоним.' })
      const first = Object.keys(found)[0]
      document.getElementById(`req-${first}`)?.focus()
      return
    }

    setSending(true)
    try {
      const res = await fetch(new URL('api/requests', document.baseURI), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, phone: fullPhone(form.phone), website: honeypot }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        if (data.fields) setErrors(data.fields)
        throw new Error(data.error || 'Не вдалося надіслати заявку')
      }
      setToast({ kind: 'success', title: 'Заявку надіслано', text: `Дякуємо, ${form.name.trim().split(' ')[0]}! Ми передзвонимо вам найближчим часом, щоб усе узгодити.` })
      setForm(EMPTY)
      setErrors({})
      setTouched(false)
    } catch (error) {
      setToast({ kind: 'error', title: 'Не вдалося надіслати', text: `${error instanceof Error ? error.message : 'Помилка мережі'}. Спробуйте ще раз або зателефонуйте: ${PHONE_LABEL}.` })
    } finally {
      setSending(false)
    }
  }

  const fieldClass = (key: keyof RequestForm) => cn('field font-normal', errors[key] && '!border-red-500 focus:!shadow-[0_0_0_4px_rgba(220,38,38,.15)]')
  const describedBy = (key: keyof RequestForm) => (errors[key] ? `req-${key}-error` : undefined)

  return (
    <section id="services" className="relative overflow-hidden bg-parchment py-28 sm:py-36">
      <Toast message={toast} onClose={closeToast} />
      <div className="shell grid gap-16 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
        <div>
          <SectionHeading
            index="08"
            eyebrow="Таїнства та треби"
            title={<>Замовити <em className="text-primary">богослужіння</em></>}
            lead="Заявка на Хрещення чи Вінчання. Залиште контакти, і ми зателефонуємо, щоб домовитися про день і підготовку."
          />
          <ol className="reveal mt-12 space-y-6">
            {STEPS.map((s, i) => (
              <li key={s} className="flex gap-5">
                <span className="font-display text-4xl leading-none text-gold">{i + 1}</span>
                <p className="pt-1 leading-relaxed text-ink/80">{s}</p>
              </li>
            ))}
          </ol>
          <div className="reveal relative mt-12 overflow-hidden rounded-3xl">
            <img src={photo('parish/liturgy-mitre.jpg')} alt="Священник під час Божественної літургії в Петропавлівському храмі" className="aspect-[16/10] w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-night/85 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-ivory">
              <p className="text-xs uppercase tracking-[0.2em] text-gold-light">Термінові питання</p>
              <a href={`tel:${PHONE}`} className="mt-2 inline-flex items-center gap-3 font-display text-3xl hover:underline"><Phone className="size-6 text-gold" />{PHONE_LABEL}</a>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate className="reveal self-start rounded-[2rem] border border-gold/30 bg-card p-7 shadow-[0_40px_100px_-60px_rgba(74,15,18,.6)] sm:p-11">
          <div className="flex items-center justify-between border-b border-border pb-6">
            <h3 className="font-display text-3xl text-ink">Заява на богослужіння</h3>
            <span className="hidden text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-deep sm:block">Петропавлівський храм</span>
          </div>

          <fieldset className="mt-8">
            <legend className="text-sm font-semibold text-ink">Оберіть таїнство</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {REQUEST_TYPES.map(([key, label]) => (
                <button key={key} type="button" className="chip" aria-pressed={form.type === key} onClick={() => update('type', key)}>{label}</button>
              ))}
            </div>
          </fieldset>

          {/* Пастка для ботів: людина цього поля не бачить */}
          <label className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">Сайт<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} /></label>

          <div className="mt-8 grid gap-5">
            <div className="grid gap-2">
              <label htmlFor="req-name" className="text-sm font-semibold text-ink">Ваше ім’я *</label>
              <input id="req-name" className={fieldClass('name')} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Наприклад, Марія Коваль" autoComplete="name" maxLength={80} aria-invalid={Boolean(errors.name)} aria-describedby={describedBy('name')} />
              <FieldError id="req-name-error" message={errors.name} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid content-start gap-2">
                <label htmlFor="req-phone" className="text-sm font-semibold text-ink">Номер телефону *</label>
                <div className={cn('flex items-stretch overflow-hidden rounded-xl border bg-[#fffdf8] transition focus-within:border-gold focus-within:shadow-[0_0_0_4px_rgb(198_160_82/0.18)]', errors.phone ? 'border-red-500' : 'border-input')}>
                  <span className="flex select-none items-center border-r border-input bg-parchment/70 px-3.5 text-[0.95rem] font-semibold text-ink" aria-hidden="true">+38</span>
                  <input id="req-phone" type="tel" inputMode="numeric" className="min-w-0 flex-1 bg-transparent px-3.5 py-[0.85rem] text-[0.95rem] text-foreground outline-none placeholder:text-[#9a8f80]" value={form.phone} onChange={(e) => update('phone', formatLocalPhone(e.target.value))} placeholder="0XX XXX XX XX" autoComplete="tel-national" maxLength={13} aria-label="Номер телефону після +38" aria-invalid={Boolean(errors.phone)} aria-describedby={describedBy('phone')} />
                </div>
                <FieldError id="req-phone-error" message={errors.phone} />
              </div>
              <div className="grid content-start gap-2">
                <label htmlFor="req-date" className="text-sm font-semibold text-ink">Бажана дата</label>
                <input id="req-date" type="date" min={today()} className={fieldClass('date')} value={form.date} onChange={(e) => update('date', e.target.value)} aria-invalid={Boolean(errors.date)} aria-describedby={describedBy('date')} />
                <FieldError id="req-date-error" message={errors.date} />
              </div>
            </div>
            <div className="grid gap-2">
              <div className="flex items-baseline justify-between">
                <label htmlFor="req-intention" className="text-sm font-semibold text-ink">Коментар</label>
                <span className={cn('text-xs', form.intention.length > 1000 ? 'text-red-700' : 'text-muted-foreground')}>{form.intention.length}/1000</span>
              </div>
              <textarea id="req-intention" rows={4} className={cn(fieldClass('intention'), 'resize-y')} value={form.intention} onChange={(e) => update('intention', e.target.value)} placeholder="Побажання щодо часу, імена, питання до священника…" aria-invalid={Boolean(errors.intention)} aria-describedby={describedBy('intention')} />
              <FieldError id="req-intention-error" message={errors.intention} />
            </div>

            <div className={cn('rounded-2xl border p-4 transition-colors', errors.consent ? 'border-red-400 bg-red-50' : form.consent ? 'border-emerald-300 bg-emerald-50/60' : 'border-border bg-parchment/50')}>
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink/80">
                <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
                  <input id="req-consent" type="checkbox" checked={form.consent} onChange={(e) => update('consent', e.target.checked)} className="peer size-5 cursor-pointer appearance-none rounded-md border-2 border-gold-deep/60 bg-white transition checked:border-emerald-600 checked:bg-emerald-600" aria-invalid={Boolean(errors.consent)} aria-describedby={describedBy('consent')} />
                  <Check className="pointer-events-none absolute size-3.5 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
                </span>
                <span>Я перевірив(ла) ім’я та номер телефону. Погоджуюся, щоб парафія зв’язалася зі мною щодо цієї заявки. *</span>
              </label>
              <FieldError id="req-consent-error" message={errors.consent} />
            </div>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <MetalButton variant="bronze" type="submit" disabled={sending}>
              <span className="inline-flex items-center gap-2">{sending && <Loader2 className="size-4 animate-spin" />}{sending ? 'Надсилаємо…' : 'Надіслати заявку'}</span>
            </MetalButton>
            <p className="text-xs text-muted-foreground">Заявку бачать лише адміністратори парафії.</p>
          </div>
        </form>
      </div>
    </section>
  )
}
