import { useState, type FormEvent } from 'react'
import { ShieldCheck } from 'lucide-react'
import { MetalButton } from '@/components/ui/liquid-glass-button'
import { PAYMENT_URL, photo } from '@/lib/parish'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'

const CAUSES = [['потреби храму', 'На храм'], ['потреби парафії', 'На парафію'], ['підтримка сайту парафії', 'На сайт парафії']] as const
const AMOUNTS = [100, 200, 500, 1000]
const MIN = 10
const MAX = 100_000

export function Donate() {
  const [cause, setCause] = useState<string>(CAUSES[0][0])
  const [amount, setAmount] = useState(200)
  const [custom, setCustom] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState('')

  const valid = Number.isFinite(amount) && amount >= MIN && amount <= MAX

  function pickCustom(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 6)
    setCustom(digits)
    if (digits) setAmount(Number(digits))
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!valid) return setStatus(`Вкажіть суму від ${MIN} до ${MAX.toLocaleString('uk-UA')} ₴.`)
    if (!consent) return setStatus('Поставте галочку, що перевірите одержувача, суму та призначення.')
    setStatus(`Відкриваємо ПриватБанк: ${amount} ₴ · ${cause}. Перевірте суму й одержувача перед підтвердженням.`)
    // Суму додаємо до посилання; вона також є на кнопці, якщо банк її не підставить сам
    const url = new URL(PAYMENT_URL)
    url.searchParams.set('amount', String(amount))
    window.open(url.href, '_blank', 'noopener,noreferrer')
  }

  return (
    <section id="donate" className="grain relative isolate overflow-hidden bg-night py-28 text-ivory sm:py-36">
      <img src={photo('rector-liturgy-with-clergy.jpg')} alt="" className="absolute inset-y-0 right-0 -z-10 h-full w-full object-cover opacity-30 lg:w-1/2 lg:opacity-60" loading="lazy" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night via-night/95 to-night/40" />
      <div className="shell grid gap-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
        <div>
          <SectionHeading
            dark
            index="12"
            eyebrow="Добра справа"
            title={<>Підтримати <em className="gold-text">храм</em></>}
            lead="Ваша пожертва допомагає зберігати шестисотлітню святиню, звершувати богослужіння та піклуватися про літніх парафіян."
          />
          <div className="reveal mt-12 sm:mt-16">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-gold-light/80">Як це працює</p>
            <p className="mt-5 max-w-lg leading-relaxed text-ivory/75">Ви можете переказати гроші на потреби храму, парафії та на підтримку сайту парафії. Обираєте напрям і суму, ставите галочку, і відкривається ПриватБанк, де вже вказано суму переказу. Лишається тільки підтвердити платіж.</p>
            <ol className="mt-8 space-y-4">
              {['Оберіть, на що спрямувати допомогу', 'Натисніть суму або впишіть свою', 'Поставте галочку й натисніть «Перейти до оплати»', 'У ПриватБанку підтвердіть переказ'].map((step, i) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-gold/50 font-display text-lg text-gold-light">{i + 1}</span>
                  <span className="pt-1 text-ivory/70">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-8 max-w-md leading-relaxed text-ivory/65">Дякуємо кожному, хто підтримує храм. Нехай Господь віддячить вам сторицею.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate className="reveal glass-panel self-start rounded-[2rem] p-7 sm:p-10">
          <fieldset>
            <legend className="text-sm font-semibold text-ivory/80">Напрям підтримки</legend>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {CAUSES.map(([value, label]) => (
                <button key={value} type="button" aria-pressed={cause === value} onClick={() => setCause(value)} className={cn('rounded-xl border px-3 py-3 text-sm font-semibold transition', cause === value ? 'border-gold bg-gold/15 text-gold-light' : 'border-white/15 text-ivory/70 hover:border-white/40')}>{label}</button>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-7">
            <legend className="text-sm font-semibold text-ivory/80">Сума, грн</legend>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {AMOUNTS.map((a) => (
                <button key={a} type="button" aria-pressed={amount === a && !custom} onClick={() => { setAmount(a); setCustom('') }} className={cn('rounded-xl border py-4 font-display text-2xl transition', amount === a && !custom ? 'border-gold bg-gold text-night' : 'border-white/15 text-ivory hover:border-white/40')}>{a}</button>
              ))}
            </div>
            <label className="mt-3 flex items-center gap-3 rounded-xl border border-white/15 px-4 py-3 transition focus-within:border-gold">
              <span className="text-sm text-ivory/60">Інша сума</span>
              <input value={custom} onChange={(e) => pickCustom(e.target.value)} inputMode="numeric" placeholder="300" aria-label="Інша сума, гривень" className="min-w-0 flex-1 bg-transparent text-right font-display text-2xl text-ivory outline-none placeholder:font-sans placeholder:text-sm placeholder:text-ivory/30" />
              <span className="font-display text-2xl text-ivory/70">₴</span>
            </label>
          </fieldset>
          <label className="mt-7 flex items-start gap-3 text-sm leading-relaxed text-ivory/65">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[#c6a052]" />
            Я перевірю одержувача, суму та призначення платежу перед підтвердженням у банку.
          </label>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <MetalButton variant="gold" type="submit">Перейти до оплати · {valid ? amount : '…'} ₴</MetalButton>
          </div>
          {status && <p role="status" className="mt-5 text-sm text-gold-light">{status}</p>}
          <p className="mt-6 flex items-center gap-2 text-xs text-ivory/45"><ShieldCheck className="size-4" />Оплата відбувається в ПриватБанку (Privat24). Сайт не бачить ваших платіжних даних.</p>
        </form>
      </div>
    </section>
  )
}
