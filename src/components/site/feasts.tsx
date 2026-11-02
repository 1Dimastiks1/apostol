import { useEffect, useMemo, useRef, useState } from 'react'
import { useScroll, useTransform } from 'framer-motion'
import { X } from 'lucide-react'
import IntroAnimation, { MORPH_MAX_SCROLL, type MorphItem } from '@/components/ui/scroll-morph-hero'
import { FEASTS } from '@/lib/feasts'
import { photo } from '@/lib/parish'
import { cn } from '@/lib/utils'

export function Feasts() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<number | null>(null)

  // Прогрес сторінки через липку секцію → віртуальна прокрутка компонента
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })
  const progress = useTransform(scrollYProgress, [0.04, 0.96], [0, MORPH_MAX_SCROLL], { clamp: true })

  const items: MorphItem[] = useMemo(() => FEASTS.map((f) => ({
    src: photo(f.icon), alt: `Ікона: ${f.title}`, label: f.short, caption: f.date,
  })), [])

  const feast = selected === null ? null : FEASTS[selected]

  useEffect(() => {
    if (selected === null) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
      if (e.key === 'ArrowLeft') setSelected((i) => (i === null ? i : (i + FEASTS.length - 1) % FEASTS.length))
      if (e.key === 'ArrowRight') setSelected((i) => (i === null ? i : (i + 1) % FEASTS.length))
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [selected])

  return (
    <section id="feasts" aria-label="Дванадесяті свята" className="relative bg-night text-ivory">
      <div ref={trackRef} className="relative h-[480vh]">
        <div className="grain sticky top-0 h-svh overflow-hidden">
          <IntroAnimation
            className="relative h-full w-full overflow-hidden bg-night"
            items={items}
            progress={progress}
            introTitle={<>Дванадесяті <span className="gold-text italic">свята</span></>}
            introHint="ПРОКРУЧУЙТЕ, ЩОБ ВІДКРИТИ"
            title={<>Дванадесять <span className="gold-text italic">великих свят</span></>}
            description={<>Церковний рік від Різдва Богородиці до Успіння. Наведіть на ікону або торкніться її, щоб прочитати про свято. Прокручуйте далі, щоб побачити всі дванадесять.</>}
            onSelect={setSelected}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(90,20,24,.5),transparent_65%)]" aria-hidden="true" />
        </div>
      </div>

      {/* Запасний перелік для читачів з клавіатури та екранних дикторів */}
      <ul className="sr-only">
        {FEASTS.map((f, i) => <li key={f.id}><button type="button" onClick={() => setSelected(i)}>{f.title}, {f.date}</button></li>)}
      </ul>

      {feast && selected !== null && (
        <div role="dialog" aria-modal="true" aria-label={feast.title} className="fixed inset-0 z-[90] overflow-y-auto bg-night/95 backdrop-blur-md" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="shell relative grid min-h-full items-center gap-10 py-20 lg:grid-cols-[.8fr_1.2fr] lg:gap-16" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
            <button type="button" onClick={() => setSelected(null)} aria-label="Закрити" className="fixed right-5 top-5 z-10 grid size-12 place-items-center rounded-full border border-white/20 bg-night/80 hover:border-gold"><X className="size-5" /></button>

            <figure className="mx-auto w-full max-w-[420px]">
              <div className="arch overflow-hidden border border-gold/40 bg-wine-deep shadow-[0_40px_100px_-40px_rgba(198,160,82,.4)]">
                <img src={photo(feast.icon)} alt={`Ікона: ${feast.title}`} className="aspect-[3/4] w-full object-cover" />
              </div>
              <figcaption className="mt-4 text-center text-xs leading-relaxed text-ivory/45">
                {feast.credit.work}. {feast.credit.license}. <a className="underline underline-offset-2 hover:text-gold-light" href={feast.credit.url} target="_blank" rel="noopener noreferrer">Джерело ↗</a>
              </figcaption>
            </figure>

            <div>
              <p className="eyebrow on-dark">{feast.kind} свято · {selected + 1} з {FEASTS.length}</p>
              <h3 className="display mt-5 text-[clamp(2.2rem,4.6vw,4rem)]">{feast.title}</h3>
              <p className="mt-5 inline-block rounded-full border border-gold/40 px-4 py-1.5 text-sm font-semibold text-gold-light">{feast.date}</p>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-ivory/75">{feast.text}</p>

              <div className="mt-10 flex gap-3">
                <button type="button" onClick={() => setSelected((selected + FEASTS.length - 1) % FEASTS.length)} className={cn('chip !text-ivory/80 !border-white/20 hover:!border-gold')}>← {FEASTS[(selected + FEASTS.length - 1) % FEASTS.length].short}</button>
                <button type="button" onClick={() => setSelected((selected + 1) % FEASTS.length)} className={cn('chip !text-ivory/80 !border-white/20 hover:!border-gold')}>{FEASTS[(selected + 1) % FEASTS.length].short} →</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
