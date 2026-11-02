import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { photo } from '@/lib/parish'
import { Embers } from '@/components/ui/embers'

const SLIDES = [
  { file: 'church-exterior-old-town.jpg', title: 'Серед мурів Старого міста', text: 'Святиня на вулиці Татарській, яку знають в Кам’янці-Подільському вже багато століть.' },
  { file: 'parish/bell-tower-gate.jpg', title: 'Вхід на подвір’я', text: 'Давня кам’яна брама й дзвіниця зустрічають кожного, хто приходить помолитися.' },
  { file: 'parish/interior-nave.jpg', title: 'У храмі', text: 'Світлий неф, золотий іконостас і тиша, у якій легко молитися.' },
  { file: 'parish/apse-spruce.jpg', title: 'Храм у зелені', text: 'Затишне подвір’я з трояндами й ялинками навколо давньої святині.' },
  { file: 'parish/analoy-gospel.jpg', title: 'Святині храму', text: 'Євангеліє, хрест і образи на аналої посеред храму.' },
  { file: 'parish/iconostasis-gold.jpg', title: 'Іконостас', text: 'Різьблений позолочений іконостас, серце храму.' },
  { file: 'parish/gate-cross.jpg', title: 'Брама з хрестом', text: 'Дерев’яний хрест і плющ біля входу на територію храму.' },
  { file: 'parish/garden-swing.jpg', title: 'Куточок тиші', text: 'Троянди, лавка й затінок, щоб перепочити після молитви.' },
  { file: 'parish/paschal-liturgy.jpg', title: 'Пасхальна радість', text: 'Урочисте богослужіння, коли храм вітає: «Христос воскрес!»' },
]

function Slide({ s, i, progress }: { s: (typeof SLIDES)[number]; i: number; progress: MotionValue<number> }) {
  // Фото всередині картки рухається повільніше за саму картку — відчуття глибини
  const center = (i + 0.5) / SLIDES.length
  const shift = useTransform(progress, [center - 0.35, center + 0.35], ['-9%', '9%'])
  return (
    <article className="relative h-[46svh] w-[62vw] shrink-0 overflow-hidden rounded-[1.5rem] border border-gold/25 bg-wine-deep sm:w-[34vw] lg:w-[24vw]">
      <motion.img style={{ x: shift, scale: 1.2 }} src={photo(s.file)} alt={s.title} loading="lazy" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <p className="font-display text-sm text-gold-light">{String(i + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}</p>
        <h3 className="display mt-2 text-2xl sm:text-3xl">{s.title}</h3>
        <p className="mt-2 max-w-xs text-[0.82rem] leading-relaxed text-ivory/75">{s.text}</p>
      </div>
    </article>
  )
}

/** Липка секція: прокрутка вниз гортає стрічку світлин храму вбік */
export function Pilgrimage() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 })
  const rowRef = useRef<HTMLDivElement>(null)
  const [dist, setDist] = useState(0)
  useEffect(() => {
    const measure = () => setDist(Math.max(0, (rowRef.current?.scrollWidth ?? 0) - window.innerWidth + 0.08 * window.innerWidth))
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  const x = useTransform(progress, [0, 1], [0, -dist])
  const bar = useTransform(progress, [0, 1], ['0%', '100%'])
  const titleY = useTransform(progress, [0, 0.25], [0, -40])
  const titleOpacity = useTransform(progress, [0, 0.3], [1, 0.25])

  return (
    <section id="pilgrimage" aria-label="Світлини храму" className="relative bg-night text-ivory">
      <div ref={ref} className="relative h-[420vh]">
        <div className="grain sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
          <Embers />
          <motion.div style={{ y: titleY, opacity: titleOpacity }} className="shell mb-10">
            <p className="eyebrow on-dark">Образи храму</p>
            <h2 className="display mt-4 text-[clamp(2.2rem,5vw,4.4rem)]">Дорогою до <span className="gold-text italic">святині</span></h2>
          </motion.div>
          <motion.div ref={rowRef} style={{ x }} className="flex gap-6 pl-[4vw] will-change-transform">
            {SLIDES.map((s, i) => <Slide key={s.file} s={s} i={i} progress={progress} />)}
          </motion.div>
          <div className="shell mt-10"><div className="h-px w-full bg-white/10"><motion.div style={{ width: bar }} className="h-px bg-gold" /></div></div>
        </div>
      </div>
    </section>
  )
}
