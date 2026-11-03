import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Check, Download, Share, SquarePlus, X } from 'lucide-react'

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
const FLAG = 'parish-app-installed'
const wasInstalled = () => { try { return localStorage.getItem(FLAG) === '1' } catch { return false } }
const rememberInstalled = () => { try { localStorage.setItem(FLAG, '1') } catch { /* приватний режим */ } }

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

const Step = ({ n, children }: { n: number; children: ReactNode }) => (
  <li className="flex items-start gap-4">
    <span className="grid size-9 shrink-0 place-items-center rounded-full border border-gold/50 bg-gold/10 font-display text-lg text-gold-light">{n}</span>
    <span className="pt-1">{children}</span>
  </li>
)

/** Підказка знизу екрана (на телефоні на всю ширину, на великих екранах по центру): великий текст, зручне закриття, відступи під смужку iPhone */
function HowToSheet({ platform, icon: appIcon, title, onClose }: { platform: 'ios' | 'android' | 'desktop'; icon: string; title: string; onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [onClose])

  const icon = 'mx-1 inline size-5 -translate-y-0.5 text-gold-light'
  return (
    <div role="dialog" aria-modal="true" aria-label="Як встановити застосунок" className="fixed inset-0 z-[200] flex items-end justify-center bg-night/75 backdrop-blur-sm sm:items-center sm:p-6" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-md overflow-y-auto rounded-t-[2rem] border border-b-0 border-gold/30 bg-night px-6 pt-3 text-ivory shadow-[0_-30px_80px_-30px_rgba(0,0,0,.9)] sm:rounded-[2rem] sm:border-b sm:px-8 sm:pt-8" style={{ maxHeight: '88svh', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-white/20 sm:hidden" aria-hidden="true" />
        <button type="button" onClick={onClose} aria-label="Закрити" className="absolute right-4 top-4 grid size-11 place-items-center rounded-full text-ivory/70 hover:bg-white/10 sm:right-5 sm:top-5"><X className="size-5" /></button>
        <div className="flex items-center gap-4 pr-12">
          <img src={appIcon} alt="" className="size-14 shrink-0 rounded-2xl border border-gold/30" />
          <div>
            <h3 className="font-display text-[1.65rem] leading-tight">{title}</h3>
            <p className="mt-0.5 text-sm text-ivory/60">Іконка храму на вашому екрані</p>
          </div>
        </div>
        <ol className="mt-7 space-y-5 text-[1.02rem] leading-relaxed text-ivory/85">
          {platform === 'ios' && (<>
            <Step n={1}>Відкрийте сайт у <b>Safari</b> і натисніть <Share className={icon} /><b>«Поділитися»</b> внизу екрана.</Step>
            <Step n={2}>Прокрутіть список і оберіть <SquarePlus className={icon} /><b>«На екран “Додому”»</b>.</Step>
            <Step n={3}>Натисніть <b>«Додати»</b>. Іконка з’явиться на екрані.</Step>
          </>)}
          {platform === 'android' && (<>
            <Step n={1}>Натисніть меню <b>⋮</b> угорі праворуч у Chrome.</Step>
            <Step n={2}>Оберіть <b>«Встановити програму»</b> або <b>«Додати на головний екран»</b>.</Step>
            <Step n={3}>Підтвердьте. Іконка з’явиться на екрані.</Step>
          </>)}
          {platform === 'desktop' && (<>
            <Step n={1}>У Chrome чи Edge знайдіть значок встановлення <Download className={icon} /> у правій частині адресного рядка.</Step>
            <Step n={2}>Натисніть його й оберіть <b>«Встановити»</b>.</Step>
            <Step n={3}>Застосунок відкриється в окремому вікні.</Step>
          </>)}
        </ol>
        <button type="button" onClick={onClose} className="mt-8 flex min-h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-b from-[#f3dfa0] to-[#a8853c] px-6 text-base font-bold text-night shadow-lg">Зрозуміло</button>
      </div>
    </div>
  )
}

/** Кнопка «Встановити як програму» є завжди, поки сайт не встановлено: де браузер дозволяє, встановлює одним дотиком, інакше показує підказку для iPhone чи меню браузера */
export function InstallApp({ icon = `${import.meta.env.BASE_URL}icons/icon-192.png`, title = 'Встановіть застосунок', compact = false }: { icon?: string; title?: string; compact?: boolean } = {}) {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null)
  const [installed, setInstalled] = useState(true)
  const [help, setHelp] = useState(false)
  const ios = typeof navigator !== 'undefined' && isIos()
  const android = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)

  useEffect(() => {
    // Відкрито як програму, або раніше вже встановлювали на цьому пристрої
    if (isStandalone()) rememberInstalled()
    setInstalled(isStandalone() || wasInstalled())
    const onPrompt = (e: Event) => { e.preventDefault(); setPrompt(e as InstallPrompt) }
    const onInstalled = () => { rememberInstalled(); setInstalled(true); setPrompt(null) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled) }
  }, [])

  if (installed) {
    return (
      <span className={compact ? 'grid size-11 place-items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 text-emerald-200' : 'inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-5 py-2.5 text-sm font-bold text-emerald-200 sm:text-xs'} role="status" title="Застосунок встановлено" aria-label="Застосунок встановлено">
        <Check className="size-4" />{!compact && 'Застосунок встановлено'}
      </span>
    )
  }

  async function install() {
    if (prompt) {
      await prompt.prompt()
      const choice = await prompt.userChoice
      setPrompt(null)
      if (choice.outcome === 'accepted') { rememberInstalled(); setInstalled(true) }
    } else setHelp(true)
  }

  return (
    <>
      <button type="button" onClick={install} aria-label="Встановити як програму" title="Встановити як програму" className={compact ? 'grid size-11 place-items-center rounded-full border border-white/15 text-gold-light transition hover:border-gold' : 'inline-flex min-h-11 items-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 text-sm font-bold text-gold-light transition hover:border-gold hover:bg-gold/10 sm:text-xs'}>
        <Download className="size-4" />{!compact && 'Встановити як програму'}
      </button>
      {help && createPortal(<HowToSheet platform={ios ? 'ios' : android ? 'android' : 'desktop'} icon={icon} title={title} onClose={() => setHelp(false)} />, document.body)}
    </>
  )
}
