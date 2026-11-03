import { useEffect, useState } from 'react'
import { Menu, X, Facebook } from 'lucide-react'
import { MetalButton } from '@/components/ui/liquid-glass-button'
import { PARISH_PAGE } from '@/lib/parish'
import { cn } from '@/lib/utils'
import { scrollToId } from './section-heading'

const LINKS = [
  ['Розклад', 'schedule'],
  ['Онлайн', 'online'],
  ['Календар', 'calendar'],
  ['Свята', 'feasts'],
  ['Храм', 'rector'],
  ['Події', 'news'],
  ['Треби', 'services'],
  ['Контакти', 'contacts'],
] as const

const TEXT_SIZES = ['А', 'А+', 'А++']

function readTextSize() {
  try { return Number(localStorage.getItem('parish-text-size')) || 0 } catch { return 0 }
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [textSize, setTextSize] = useState(readTextSize)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.textSize = String(textSize)
    try { localStorage.setItem('parish-text-size', String(textSize)) } catch { /* приватний режим */ }
  }, [textSize])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  return (
    <header style={{ paddingTop: `calc(${scrolled || open ? '0.75rem' : '1.25rem'} + env(safe-area-inset-top, 0px))` }} className={cn('fixed inset-x-0 top-0 z-50 transition-all duration-500', scrolled || open ? 'bg-night/85 pb-3 shadow-[0_10px_40px_-20px_rgba(0,0,0,.8)] backdrop-blur-xl' : 'bg-transparent pb-5')}>
      <div className="shell flex items-center justify-between gap-6">
        <a href="#home" className="group flex items-center gap-3.5 text-ivory" aria-label="На головну">
          <span className="relative grid size-10 shrink-0 sm:size-11 place-items-center rounded-full border border-gold/50 bg-gradient-to-b from-wine to-wine-deep text-gold-light shadow-[inset_0_1px_0_rgba(255,255,255,.15)] transition group-hover:border-gold">
            <svg width="16" height="22" viewBox="0 0 18 24" fill="none" aria-hidden="true"><path d="M9 0v24M3 6h12M5 17l8-3" stroke="currentColor" strokeWidth="1.6" /></svg>
          </span>
          <span className="leading-tight">
            <span className="block whitespace-nowrap font-display text-lg font-semibold tracking-wide sm:text-[1.35rem]">Петропавлівський храм</span>
            <span className="block text-[0.55rem] font-bold tracking-[0.22em] text-gold-light/80 sm:text-[0.6rem] sm:tracking-[0.3em]">ПРАВОСЛАВНА ЦЕРКВА УКРАЇНИ</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 xl:flex" aria-label="Основна навігація">
          {LINKS.map(([label, id]) => (
            <a key={id} href={`#${id}`} className="relative text-[0.8rem] font-semibold tracking-wide text-ivory/75 transition hover:text-ivory after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gold after:transition-transform hover:after:scale-x-100">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center rounded-full border border-white/15 p-1 md:flex" role="group" aria-label="Розмір шрифту">
            {TEXT_SIZES.map((label, i) => (
              <button key={label} type="button" onClick={() => setTextSize(i)} aria-pressed={textSize === i} className={cn('h-7 min-w-8 rounded-full px-2 font-display text-sm font-semibold transition', textSize === i ? 'bg-gold text-night' : 'text-ivory/70 hover:text-ivory')}>
                {label}
              </button>
            ))}
          </div>
          <a href={PARISH_PAGE} target="_blank" rel="noopener noreferrer" aria-label="Сторінка парафії у Facebook" className="hidden size-10 place-items-center rounded-full border border-white/15 text-ivory/80 transition hover:border-gold hover:text-gold-light sm:grid">
            <Facebook className="size-4" />
          </a>
          <div className="hidden sm:block">
            <MetalButton variant="gold" onClick={() => scrollToId('donate')}>Пожертва</MetalButton>
          </div>
          <button type="button" className="grid size-11 place-items-center rounded-full border border-white/15 text-ivory xl:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Закрити меню' : 'Відкрити меню'}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="shell xl:hidden">
          <nav className="mt-4 grid gap-1 border-t border-white/10 pb-6 pt-4" aria-label="Мобільна навігація">
            {LINKS.map(([label, id]) => (
              <a key={id} href={`#${id}`} onClick={() => setOpen(false)} className="flex items-center justify-between rounded-xl px-3 py-3.5 font-display text-2xl text-ivory hover:bg-white/5">
                {label}<span className="text-gold" aria-hidden="true">→</span>
              </a>
            ))}
            <div className="mt-4 flex items-center justify-between gap-3 px-3">
              <div className="flex items-center rounded-full border border-white/15 p-1" role="group" aria-label="Розмір шрифту">
                {TEXT_SIZES.map((label, i) => (
                  <button key={label} type="button" onClick={() => setTextSize(i)} aria-pressed={textSize === i} className={cn('h-8 min-w-10 rounded-full px-2 font-display font-semibold', textSize === i ? 'bg-gold text-night' : 'text-ivory/70')}>{label}</button>
                ))}
              </div>
              <MetalButton variant="gold" onClick={() => { setOpen(false); scrollToId('donate') }}>Пожертва</MetalButton>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
