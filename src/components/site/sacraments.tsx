import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { photo } from '@/lib/parish'
import { MetalButton } from '@/components/ui/liquid-glass-button'
import { scrollToId } from './section-heading'

type CardData = { tag: string; title: string; text: string; img: string; action?: string; target?: string }

const CARDS: CardData[] = [
  { tag: 'Щонеділі', title: 'Божественна літургія', text: 'Спільна молитва громади. Можна подати записку за здоров’я чи за упокій, поставити свічку й долучитися до причастя.', img: 'parish/paschal-liturgy.jpg', action: 'Розклад богослужінь', target: 'schedule' },
  { tag: 'Таїнство', title: 'Хрещення', text: 'Вхід дитини чи дорослого до Церкви. Домовтеся про дату заздалегідь, священник пояснить усе, що потрібно підготувати.', img: 'parish/analoy-gospel.jpg' },
  { tag: 'Таїнство', title: 'Вінчання', text: 'Благословення подружжя перед Богом. Залиште заявку, і ми зателефонуємо, щоб погодити день і підготовку.', img: 'parish/iconostasis-gold.jpg' },
]

function Card({ c, i, progress }: { c: CardData; i: number; progress: MotionValue<number> }) {
  const n = CARDS.length
  const start = i / n
  const end = (i + 1) / n
  // Нова картка виїжджає знизу, а попередні відступають і темніють
  const y = useTransform(progress, [Math.max(0, start - 1 / n), start], i === 0 ? ['0%', '0%'] : ['105%', '0%'])
  const scale = useTransform(progress, [start, end], [1, i === n - 1 ? 1 : 0.9])
  const dim = useTransform(progress, [start, end], [0, i === n - 1 ? 0 : 0.6])
  return (
    <motion.article style={{ y, scale, zIndex: i }} className="absolute inset-x-0 top-0 mx-auto h-[64svh] w-[min(92vw,1080px)] origin-top overflow-hidden rounded-[2rem] border border-gold/25 bg-wine-deep shadow-[0_40px_120px_-40px_rgba(0,0,0,.8)]">
      <div className="grid h-full lg:grid-cols-[1.05fr_.95fr]">
        <div className="flex flex-col justify-between p-8 sm:p-12">
          <div>
            <p className="eyebrow on-dark">{c.tag}</p>
            <h3 className="display mt-5 text-[clamp(2rem,4.2vw,3.6rem)]">{c.title}</h3>
            <p className="mt-6 max-w-md leading-relaxed text-ivory/75">{c.text}</p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <MetalButton variant="gold" onClick={() => scrollToId(c.target ?? 'services')}>{c.action ?? 'Залишити заявку'}</MetalButton>
            <span className="font-display text-5xl text-gold/40">{String(i + 1).padStart(2, '0')}</span>
          </div>
        </div>
        <div className="relative hidden lg:block">
          <img src={photo(c.img)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-wine-deep via-transparent to-transparent" />
        </div>
      </div>
      <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-night" />
    </motion.article>
  )
}

/** Липка стопка карток: прокрутка накладає їх одну на одну */
export function Sacraments() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  return (
    <section id="sacraments" aria-label="Таїнства та треби" className="relative bg-night text-ivory">
      <div ref={ref} className="relative" style={{ height: `${CARDS.length * 100 + 40}svh` }}>
        <div className="grain sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden">
          <div className="shell mb-6 w-full text-center">
            <p className="eyebrow on-dark justify-center">Таїнства та треби</p>
          </div>
          <div className="relative h-[64svh] w-full">
            {CARDS.map((c, i) => <Card key={c.title} c={c} i={i} progress={scrollYProgress} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
