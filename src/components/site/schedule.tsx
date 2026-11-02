import { Radio } from 'lucide-react'
import { SUNDAY_SCHEDULE, photo } from '@/lib/parish'
import { ExternalLink, SectionHeading } from './section-heading'
import { PARISH_PAGE } from '@/lib/parish'

export function Schedule() {
  return (
    <section id="schedule" className="relative overflow-hidden bg-ivory py-28 sm:py-36">
      <div className="pointer-events-none absolute -right-40 top-20 size-[520px] rounded-full bg-[radial-gradient(circle,rgba(198,160,82,.16),transparent_65%)]" aria-hidden="true" />
      <div className="shell grid gap-16 lg:grid-cols-[.85fr_1.15fr] lg:gap-24">
        <div>
          <SectionHeading
            index="01"
            eyebrow="Богослужіння"
            title={<>Неділі <br />та <em className="text-primary">свята</em></>}
            lead="Постійний графік богослужінь у храмі. Перед великими святами час може змінюватися — актуальні оголошення публікуємо на сторінці парафії."
          />
          <div className="reveal mt-12 overflow-hidden rounded-2xl">
            <img src={photo('parish/interior-nave.jpg')} alt="Інтер’єр Петропавлівського храму: неф і позолочений іконостас" className="aspect-[5/4] w-full object-cover" loading="lazy" />
          </div>
          <ExternalLink href={PARISH_PAGE} className="mt-8 text-primary">Оголошення парафії у Facebook</ExternalLink>
        </div>

        <ol className="self-center">
          {SUNDAY_SCHEDULE.map((item) => (
            <li key={item.time} className="reveal group grid grid-cols-[5rem_1fr] gap-6 border-b border-border py-9 first:pt-0 last:border-0 sm:grid-cols-[8rem_1fr] sm:gap-10">
              <span className="font-display text-[2.4rem] leading-none text-ink transition-colors group-hover:text-primary sm:text-[3.2rem]">{item.time}</span>
              <div className="border-l border-gold/40 pl-6 transition-colors group-hover:border-gold sm:pl-10">
                <h3 className="flex flex-wrap items-center gap-3 font-display text-[1.75rem] leading-tight text-ink">
                  {item.title}
                  {item.live && <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/10 px-2.5 py-1 font-sans text-[0.62rem] font-bold uppercase tracking-widest text-red-700"><Radio className="size-3" />Наживо</span>}
                </h3>
                <p className="mt-2 max-w-md leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function ScriptureBanner() {
  return (
    <section className="grain relative isolate overflow-hidden bg-night py-32 text-center text-ivory sm:py-44" aria-label="Слово Святого Письма">
      <img src={photo('parish/iconostasis-gold.jpg')} alt="" className="absolute inset-0 -z-10 size-full object-cover opacity-45" loading="lazy" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-night via-night/40 to-night" />
      <div className="shell reveal max-w-4xl">
        <p className="font-display text-7xl leading-none text-gold" aria-hidden="true">“</p>
        <blockquote className="display -mt-4 text-[clamp(2rem,4.6vw,3.8rem)] italic">
          Ти — Петро, і на цім камені Я збудую Церкву Мою, і пекельні ворота не переможуть її.
        </blockquote>
        <p className="mt-8 text-xs font-bold tracking-[0.35em] text-gold-light">ЄВАНГЕЛІЄ ВІД МАТВІЯ 16:18</p>
      </div>
    </section>
  )
}
