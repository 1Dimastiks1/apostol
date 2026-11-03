import { useEffect, useState } from 'react'
import { Download, Share, SquarePlus, X } from 'lucide-react'

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

/** Кнопка «Встановити програму»: на Android одним дотиком, на iPhone показує підказку (Apple не дозволяє автоматично) */
export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null)
  const [installed, setInstalled] = useState(true)
  const [help, setHelp] = useState(false)
  const ios = typeof navigator !== 'undefined' && isIos()

  useEffect(() => {
    setInstalled(isStandalone())
    const onPrompt = (e: Event) => { e.preventDefault(); setPrompt(e as InstallPrompt) }
    const onInstalled = () => { setInstalled(true); setPrompt(null) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled) }
  }, [])

  if (installed || (!prompt && !ios)) return null

  async function install() {
    if (prompt) {
      await prompt.prompt()
      await prompt.userChoice
      setPrompt(null)
    } else setHelp(true)
  }

  return (
    <>
      <button type="button" onClick={install} className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-xs font-bold text-gold-light transition hover:border-gold hover:bg-gold/10">
        <Download className="size-4" />Встановити як програму
      </button>
      {help && (
        <div role="dialog" aria-modal="true" aria-label="Як додати на екран Додому" className="fixed inset-0 z-[100] flex items-end justify-center bg-night/70 p-4 backdrop-blur-sm sm:items-center" onClick={(e) => e.target === e.currentTarget && setHelp(false)}>
          <div className="w-full max-w-sm rounded-3xl border border-gold/30 bg-night p-6 text-ivory shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-2xl">Додайте на екран «Додому»</h3>
              <button type="button" onClick={() => setHelp(false)} aria-label="Закрити" className="grid size-8 place-items-center rounded-full text-ivory/60 hover:bg-white/10"><X className="size-4" /></button>
            </div>
            <ol className="mt-5 space-y-4 text-sm leading-relaxed text-ivory/80">
              <li className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full border border-gold/50 font-display text-gold-light">1</span><span>Відкрийте сайт у браузері <b>Safari</b> і натисніть кнопку <Share className="mx-1 inline size-4 text-gold-light" /><b>«Поділитися»</b> внизу екрана.</span></li>
              <li className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full border border-gold/50 font-display text-gold-light">2</span><span>Прокрутіть список і оберіть <SquarePlus className="mx-1 inline size-4 text-gold-light" /><b>«На екран “Додому”»</b>.</span></li>
              <li className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full border border-gold/50 font-display text-gold-light">3</span><span>Натисніть <b>«Додати»</b>. Іконка храму з’явиться на екрані, і сайт відкриватиметься як програма.</span></li>
            </ol>
          </div>
        </div>
      )}
    </>
  )
}
