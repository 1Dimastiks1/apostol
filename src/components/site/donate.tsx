import { useState, type FormEvent } from 'react'
import { Flame, HandHeart, Heart, ShieldCheck } from 'lucide-react'
import { MetalButton } from '@/components/ui/liquid-glass-button'
import { PAYMENT_URL, photo } from '@/lib/parish'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'

const CAUSES = [['потреби храму', 'На храм'], ['потреби парафії', 'На парафію']] as const
const WAYS = [
  { icon: Flame, title: 'Молитвою', text: 'Спільна молитва за парафію і добродіїв.' },
  { icon: Heart, title: 'Словом', text: 'Розкажіть про храм друзям і рідним.' },
  { icon: HandHeart, title: 'Ділом', text: 'Допоможіть з прибиранням чи благоустроєм.' },
] as const
const AMOUNTS = [100, 250, 500, 1000]

export function Donate() {
  const [cause, setCause] = useState<string>(CAUSES[0][0])
  const [amount, setAmount] = useState(250)
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!consent) return setStatus('Підтвердьте, що перевірите одержувача, суму та призначення.')
    setStatus(`Відкриваємо оплату: ${amount} ₴ · ${cause}. Перевірте дані перед підтвердженням.`)
    window.open(PAYMENT_URL, '_blank', 'noopener,noreferrer')
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
          <div className="reveal mt-16 sm:mt-24">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-gold-light/80">Допомогти можна по-різному</p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-3">
              {WAYS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="spotlight rounded-2xl border border-white/10 bg-white/[.04] p-5 transition hover:border-gold/40">
                  <Icon className="size-7 text-gold" strokeWidth={1.4} />
                  <p className="mt-4 font-display text-2xl">{title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ivory/60">{text}</p>
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-md leading-relaxed text-ivory/65">Дякуємо кожному, хто підтримує храм. Нехай Господь віддячить вам сторицею.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate className="reveal glass-panel self-start rounded-[2rem] p-7 sm:p-10">
          <fieldset>
            <legend className="text-sm font-semibold text-ivory/80">Напрям підтримки</legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {CAUSES.map(([value, label]) => (
                <button key={value} type="button" aria-pressed={cause === value} onClick={() => setCause(value)} className={cn('rounded-xl border px-3 py-3 text-sm font-semibold transition', cause === value ? 'border-gold bg-gold/15 text-gold-light' : 'border-white/15 text-ivory/70 hover:border-white/40')}>{label}</button>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-7">
            <legend className="text-sm font-semibold text-ivory/80">Сума, грн</legend>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {AMOUNTS.map((a) => (
                <button key={a} type="button" aria-pressed={amount === a} onClick={() => setAmount(a)} className={cn('rounded-xl border py-4 font-display text-2xl transition', amount === a ? 'border-gold bg-gold text-night' : 'border-white/15 text-ivory hover:border-white/40')}>{a}</button>
              ))}
            </div>
          </fieldset>
          <label className="mt-7 flex items-start gap-3 text-sm leading-relaxed text-ivory/65">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 size-4 accent-[#c6a052]" />
            Розумію, що обрані тут напрям і сума можуть не передатися автоматично. Перед оплатою перевірю одержувача, суму та призначення.
          </label>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <MetalButton variant="gold" type="submit">Перейти до оплати · {amount} ₴</MetalButton>
          </div>
          {status && <p role="status" className="mt-5 text-sm text-gold-light">{status}</p>}
          <p className="mt-6 flex items-center gap-2 text-xs text-ivory/45"><ShieldCheck className="size-4" />Оплата відбувається на сторінці Privat24 / LiqPay. Сайт не бачить ваших платіжних даних.</p>
        </form>
      </div>
    </section>
  )
}
