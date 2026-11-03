import { CalendarDays, MapPin, Radio, Landmark } from 'lucide-react'
import { LiquidButton, MetalButton } from '@/components/ui/liquid-glass-button'
import type { Announcement } from '@/hooks/use-parish-data'
import { photo, sanitizeRichHtml, safeHttpUrl } from '@/lib/parish'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Embers } from '@/components/ui/embers'
import { scrollToId } from './section-heading'

const FACTS = [
  { icon: Landmark, value: 'XIV ст.', label: 'святиня Старого міста' },
  { icon: CalendarDays, value: 'Щонеділі 09:00', label: 'Божественна Літургія' },
  { icon: Radio, value: 'Наживо', label: 'трансляції у Facebook' },
  { icon: MapPin, value: 'Татарська, 9', label: 'Кам’янець-Подільський' },
]

function HeroBackdrop() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 900], [0, 180])
  const fade = useTransform(scrollY, [0, 700], [1, 0.35])
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div style={{ y, opacity: fade }} className="absolute inset-x-0 -top-[8%] h-[116%]">
        <img src={photo('parish/apse-spruce.jpg')} alt="" className="hero-zoom size-full object-cover object-[50%_35%] opacity-45" fetchPriority="high" />
      </motion.div>
      <div className="rays pointer-events-none absolute left-1/2 top-[-60%] aspect-square w-[160%] -translate-x-1/2 opacity-[.16] mix-blend-screen [background:repeating-conic-gradient(from_0deg,transparent_0deg_14deg,rgba(246,227,168,.9)_16deg,transparent_19deg)] [mask-image:radial-gradient(circle,#000_0%,transparent_60%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(90,20,24,.4),transparent_60%),linear-gradient(180deg,rgba(15,7,6,.7)_0%,rgba(15,7,6,.5)_40%,#0f0706_100%)]" />
    </div>
  )
}

export function Hero({ announcement }: { announcement: Announcement | null }) {
  const href = safeHttpUrl(announcement?.href)
  return (
    <section id="home" className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-night text-ivory">
      {/* Тло: фото нашого храму з повільним наближенням, паралаксом і променями світла */}
      <HeroBackdrop />
      <Embers className="-z-[5]" />
      <div className="shell grid flex-1 items-center gap-14 pb-16 pt-36 lg:grid-cols-[1.1fr_.9fr] lg:gap-10 lg:pt-32">
        <div className="reveal">
          <p className="eyebrow on-dark rise" style={{ ['--d' as string]: '.1s' }}>Кам’янець-Подільський · Старе місто</p>
          <h1 style={{ ['--d' as string]: '.25s' }} className="rise display mt-7 text-[clamp(3rem,7.6vw,7rem)]">
            Храм святих <br className="hidden sm:block" />апостолів
            <span className="gold-text mt-1 block italic">Петра і Павла</span>
          </h1>
          <p style={{ ['--d' as string]: '.45s' }} className="rise mt-8 max-w-xl text-lg leading-relaxed text-ivory/70">
            Шестисотлітня святиня на вулиці Татарській. Тут громада щонеділі молиться за Україну, захисників і кожного, хто потребує підтримки. Двері храму відчинені для всіх.
          </p>
          <div style={{ ['--d' as string]: '.65s' }} className="rise mt-11 grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-5">
            <LiquidButton size="xl" className="magnetic w-full rounded-full font-semibold text-ivory sm:w-auto" onClick={() => scrollToId('schedule')}>
              Розклад богослужінь
            </LiquidButton>
            <MetalButton variant="gold" className="magnetic w-full sm:w-auto" onClick={() => scrollToId('donate')}>Підтримати храм</MetalButton>
            <button type="button" onClick={() => scrollToId('online')} className="inline-flex items-center gap-2.5 text-sm font-semibold text-ivory/80 transition hover:text-ivory">
              <span className="relative flex size-2.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-70" /><span className="relative inline-flex size-2.5 rounded-full bg-red-500" /></span>
              Дивитися онлайн
            </button>
          </div>
        </div>

        <div className="reveal relative mx-auto w-full max-w-[470px] lg:mr-0">
          <div className="arch absolute -inset-4 border border-gold/30" aria-hidden="true" />
          <div className="arch absolute -inset-8 border border-gold/10" aria-hidden="true" />
          <figure className="arch relative overflow-hidden shadow-[0_40px_120px_-40px_rgba(198,160,82,.45)]">
            <img src={photo('church-exterior-old-town.jpg')} alt="Петропавлівський храм серед мурів Старого міста Кам’янця-Подільського" className="aspect-[4/5] w-full object-cover" fetchPriority="high" />
            <div className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-5 text-center text-[0.65rem] font-bold tracking-[0.3em] text-ivory/80">ВУЛ. ТАТАРСЬКА, 9</figcaption>
          </figure>

          {announcement && (
            <div className="glass-panel relative mt-8 rounded-2xl p-5 sm:absolute sm:-bottom-10 sm:-left-14 sm:mt-0 sm:max-w-[340px]">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-gold-light">{announcement.eyebrow}</p>
              <p className="mt-2 font-display text-2xl leading-tight">{announcement.title}</p>
              {announcement.rich
                ? <div className="rich mt-2 line-clamp-3 text-sm leading-relaxed text-ivory/75 [&_a]:text-gold-light" dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(announcement.text) }} />
                : <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ivory/75">{announcement.text}</p>}
              {href && <a href={href} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-bold text-gold-light underline-offset-4 hover:underline">{announcement.linkLabel} ↗</a>}
            </div>
          )}
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-night/60 backdrop-blur-md">
        <dl className="shell grid grid-cols-2 lg:grid-cols-4">
          {FACTS.map(({ icon: Icon, value, label }, i) => (
            <div key={value} className={`flex items-center gap-4 py-5 sm:py-6 ${i % 2 ? 'pl-4 sm:pl-5' : ''} ${i > 0 ? 'lg:border-l lg:border-white/10 lg:pl-8' : ''} ${i < 2 ? 'border-b border-white/10 lg:border-b-0' : ''}`}>
              <Icon className="hidden size-5 shrink-0 text-gold sm:block" strokeWidth={1.5} />
              <div>
                <dt className="font-display text-lg leading-tight text-ivory sm:text-xl">{value}</dt>
                <dd className="text-xs text-ivory/55">{label}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export function Marquee() {
  const words = ['Слава Ісусу Христу', 'Слава навіки', 'Мир дому цьому', 'Господи, помилуй', 'Святі апостоли Петре і Павле, моліть Бога за нас']
  const row = [...words, ...words]
  return (
    <div className="overflow-hidden border-y border-gold/25 bg-wine-deep py-5 text-gold-light" aria-hidden="true">
      <div className="animate-marquee flex w-max gap-10 whitespace-nowrap font-display text-2xl italic">
        {[...row, ...row].map((w, i) => (
          <span key={i} className="flex items-center gap-10">{w}<span className="text-base not-italic text-gold">✠</span></span>
        ))}
      </div>
    </div>
  )
}
