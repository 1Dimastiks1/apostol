import { useEffect, useRef, useState } from 'react'
import { ArrowUp, CalendarDays, HandCoins, ListOrdered, PenLine, Radio } from 'lucide-react'
import { ADDRESS, PARISH_PAGE, PHONE, PHONE_LABEL, RECTOR_PAGE, RECTOR_PHONE, RECTOR_PHONE_LABEL } from '@/lib/parish'
import { cn } from '@/lib/utils'
import { Ornament } from './section-heading'
import { InstallApp } from './install-app'

const COLUMNS = [
  { title: 'Богослужіння', links: [['Розклад', '#schedule'], ['Онлайн-трансляції', '#online'], ['Церковний календар', '#calendar'], ['Дванадесяті свята', '#feasts'], ['Молитви парафії', '#prayers']] },
  { title: 'Парафія', links: [['Настоятель і храм', '#rector'], ['Фотолітопис', '#gallery'], ['Події', '#news'], ['Порядок літургії', '#liturgy']] },
  { title: 'Вірянам', links: [['Замовити треби', '#services'], ['Подати записку', '#prayer-notes'], ['Часті запитання', '#faq'], ['Пожертва', '#donate']] },
]

export function SiteFooter() {
  return (
    <footer className="grain relative isolate overflow-hidden bg-night pb-[calc(7rem+env(safe-area-inset-bottom))] pt-24 text-ivory xl:pb-12">
      <div className="shell">
        <div className="text-center">
          <Ornament />
          <p className="display mt-8 text-[clamp(2.2rem,5vw,4rem)]">Храм святих апостолів <span className="gold-text italic">Петра і Павла</span></p>
          <p className="mt-4 text-xs font-bold tracking-[0.3em] text-gold-light/70">ПРАВОСЛАВНА ЦЕРКВА УКРАЇНИ · КАМ’ЯНЕЦЬ-ПОДІЛЬСЬКИЙ</p>
        </div>
        <div className="mt-20 grid gap-12 border-t border-white/10 pt-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl">Завітайте</p>
            <p className="mt-4 text-ivory/60">{ADDRESS}</p>
            <p className="mt-4 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-gold-light/60">Парафія</p>
            <a href={`tel:${PHONE}`} className="block py-1 text-gold-light hover:underline">{PHONE_LABEL}</a>
            <p className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-gold-light/60">Настоятель</p>
            <a href={`tel:${RECTOR_PHONE}`} className="block py-1 text-gold-light hover:underline">{RECTOR_PHONE_LABEL}</a>
            <div className="mt-6 flex gap-4 text-sm">
              <a href={PARISH_PAGE} target="_blank" rel="noopener noreferrer" className="text-ivory/70 hover:text-ivory">Facebook парафії ↗</a>
              <a href={RECTOR_PAGE} target="_blank" rel="noopener noreferrer" className="text-ivory/70 hover:text-ivory">Настоятеля ↗</a>
            </div>
          </div>
          {COLUMNS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-gold-light/70">{c.title}</p>
              <ul className="mt-5 space-y-3">
                {c.links.map(([label, href]) => <li key={href}><a href={href} className="text-ivory/70 transition hover:text-ivory">{label}</a></li>)}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-16 flex flex-col justify-between gap-3 border-t border-white/10 pt-8 text-xs text-ivory/40 sm:flex-row">
          <span className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center"><span>© {new Date().getFullYear()} Петропавлівська парафія ПЦУ · Кам’янець-Подільський</span><InstallApp /></span>
          <span>Ікони свят — Wikimedia Commons (дві ікони Скваряви Нової: Mykola Swarnyk, CC BY-SA 3.0).</span>
        </div>
      </div>
    </footer>
  )
}

const DOCK = [
  { icon: ListOrdered, label: 'Розклад', href: '#schedule' },
  { icon: CalendarDays, label: 'Календар', href: '#calendar' },
  { icon: PenLine, label: 'Заявка', href: '#services' },
  { icon: Radio, label: 'Онлайн', href: '#online' },
  { icon: HandCoins, label: 'Пожертва', href: '#donate' },
]

/** Нижня панель швидких переходів на телефоні, індикатор прочитання і кнопка «нагору» */
export function PageChrome() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        setProgress(max > 0 ? window.scrollY / max : 0)
      })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])

  // Курсор: підсвітка карток `.spotlight`, «магніт» для `.magnetic` і сяйво `.cursor-halo` (лише для миші)
  const halo = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let magnet: HTMLElement | null = null
    const release = () => { magnet?.style.removeProperty('--tx'); magnet?.style.removeProperty('--ty'); magnet = null }
    const move = (e: PointerEvent) => {
      halo.current?.style.setProperty('--cx', `${e.clientX}px`)
      halo.current?.style.setProperty('--cy', `${e.clientY}px`)
      const target = e.target as HTMLElement | null
      const el = target?.closest<HTMLElement>('.spotlight')
      if (el) {
        const r = el.getBoundingClientRect()
        el.style.setProperty('--mx', `${e.clientX - r.left}px`)
        el.style.setProperty('--my', `${e.clientY - r.top}px`)
      }
      const m = target?.closest<HTMLElement>('.magnetic') ?? null
      if (m !== magnet) release()
      if (m) {
        magnet = m
        const r = m.getBoundingClientRect()
        m.style.setProperty('--tx', `${(e.clientX - (r.left + r.width / 2)) * 0.22}px`)
        m.style.setProperty('--ty', `${(e.clientY - (r.top + r.height / 2)) * 0.28}px`)
      }
    }
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', release)
    return () => { window.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', release) }
  }, [])

  return (
    <>
      <div ref={halo} className="cursor-halo" aria-hidden="true" />
      <div className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-gold-deep via-gold to-gold-light" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Повернутися нагору" className={cn('magnetic fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-4 z-40 grid size-11 sm:right-5 sm:size-12 place-items-center rounded-full border border-gold/40 bg-night/90 text-gold-light shadow-xl backdrop-blur transition duration-300 hover:border-gold xl:bottom-8', progress > 0.06 ? 'opacity-100' : 'pointer-events-none translate-y-3 opacity-0')}>
        <ArrowUp className="size-5" />
      </button>
      <nav aria-label="Швидкі переходи" className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 grid grid-cols-5 rounded-2xl border border-white/10 bg-night/90 p-1.5 shadow-2xl backdrop-blur-xl xl:hidden">
        {DOCK.map(({ icon: Icon, label, href }) => (
          <a key={href} href={href} className="flex flex-col items-center gap-1 rounded-xl py-2 text-[0.62rem] font-semibold text-ivory/70 active:bg-white/10">
            <Icon className="size-5 text-gold-light" strokeWidth={1.6} />{label}
          </a>
        ))}
      </nav>
    </>
  )
}
