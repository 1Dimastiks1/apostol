import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { SectionHeading } from './section-heading'

// Загальний порядок Божественної літургії (не про конкретну парафію)
const PARTS = [
  { title: 'Проскомидія', text: 'Приготування хліба й вина для таїнства. Священник молиться за живих і спочилих, поминаючи імена з поданих записок.' },
  { title: 'Літургія слова', text: 'Співаються антифони й малий вхід, читаються Апостол та Євангеліє, звучить проповідь. Це частина, де ми слухаємо Слово Боже.' },
  { title: 'Літургія вірних', text: 'Великий вхід із дарами, Символ віри й головна молитва літургії, під час якої хліб і вино стають Тілом і Кров’ю Христовими.' },
  { title: 'Причастя', text: 'Вірні, що підготувалися постом, молитвою й сповіддю, приступають до Святої Чаші. Після цього співається подяка.' },
  { title: 'Відпуст', text: 'Священник благословляє всіх, і громада розходиться з миром, поцілувавши хрест.' },
] as const

function Step({ i, progress, title, text }: { i: number; progress: MotionValue<number>; title: string; text: string }) {
  const n = PARTS.length
  const mid = (i + 0.5) / n
  const opacity = useTransform(progress, [mid - 0.28, mid - 0.08, mid + 0.08, mid + 0.28], [0.25, 1, 1, 0.25])
  const x = useTransform(progress, [mid - 0.28, mid - 0.08], [24, 0])
  return (
    <motion.li style={{ opacity, x }} className="grid grid-cols-[3.5rem_1fr] gap-5 py-9 sm:grid-cols-[5rem_1fr]">
      <span className="font-display text-5xl leading-none text-gold sm:text-6xl">{String(i + 1).padStart(2, '0')}</span>
      <div>
        <h3 className="display text-3xl sm:text-4xl">{title}</h3>
        <p className="mt-3 max-w-xl leading-relaxed text-ivory/70">{text}</p>
      </div>
    </motion.li>
  )
}

/** Як проходить Божественна літургія: кроки по черзі підсвічуються під час прокручування */
export function Communities() {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 40%'] })
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section id="liturgy" className="grain relative isolate overflow-hidden bg-wine-deep py-28 text-ivory sm:py-36">
      <div className="pointer-events-none absolute -left-40 bottom-0 -z-10 size-[600px] rounded-full bg-[radial-gradient(circle,rgba(198,160,82,.14),transparent_65%)]" aria-hidden="true" />
      <div className="shell grid gap-14 lg:grid-cols-[.85fr_1.15fr] lg:gap-24">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            dark
            index="07"
            eyebrow="Для тих, хто вперше"
            title={<>Як проходить <em className="gold-text">літургія</em></>}
            lead="Божественна літургія є головним богослужінням Церкви. Ось її порядок простими словами, щоб було легше молитися разом."
          />
          <div className="reveal mt-10 h-px w-full max-w-xs bg-white/15"><motion.div style={{ width: bar }} className="h-px bg-gold" /></div>
        </div>
        <ol ref={ref} className="divide-y divide-white/10">
          {PARTS.map((p, i) => <Step key={p.title} i={i} progress={scrollYProgress} title={p.title} text={p.text} />)}
        </ol>
      </div>
    </section>
  )
}
