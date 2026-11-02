import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { RECTOR_PAGE, photo } from '@/lib/parish'
import { cn } from '@/lib/utils'
import { ExternalLink, SectionHeading } from './section-heading'

const RECTOR_PHOTOS = [
  { file: 'rector-oleksandr-tsisar.jpg', caption: 'Святкове облачення', alt: 'Протоієрей Олександр Цісар у святковому облаченні в храмі' },
  { file: 'rector-liturgy-reading.jpg', caption: 'Читання за богослужінням', alt: 'Протоієрей Олександр Цісар читає за богослужінням біля іконостаса' },
  { file: 'rector-liturgy-gospel.jpg', caption: 'З Євангелієм', alt: 'Протоієрей Олександр Цісар підносить Євангеліє під час літургії' },
  { file: 'rector-facebook-portrait.jpeg', caption: 'Портрет', alt: 'Портрет протоієрея Олександра Цісаря у темному підряснику' },
]

export function Rector() {
  const [active, setActive] = useState(0)
  const [more, setMore] = useState(false)
  const current = RECTOR_PHOTOS[active]

  return (
    <section id="rector" className="relative overflow-hidden bg-ivory py-28 sm:py-36">
      <div className="shell grid items-center gap-16 lg:grid-cols-[.95fr_1.05fr] lg:gap-24">
        <div className="reveal relative mx-auto w-full max-w-[480px]">
          <div className="arch pointer-events-none absolute -inset-5 border border-gold/40" aria-hidden="true" />
          <figure className="arch relative overflow-hidden bg-wine-deep shadow-[0_50px_100px_-50px_rgba(74,15,18,.7)]">
            {RECTOR_PHOTOS.map((p, i) => (
              <img key={p.file} src={photo(p.file)} alt={p.alt} loading="lazy" className={cn('aspect-[4/5] w-full object-cover object-top transition-opacity duration-700', i === active ? 'relative opacity-100' : 'absolute inset-0 opacity-0')} aria-hidden={i !== active} />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-7 text-center text-ivory">
              <p className="font-display text-2xl">Протоієрей Олександр Цісар</p>
              <p className="mt-1 text-xs tracking-[0.2em] text-gold-light/90 uppercase">Настоятель · {current.caption}</p>
            </figcaption>
          </figure>
          <div className="mt-8 grid grid-cols-4 gap-3" role="group" aria-label="Фотографії настоятеля">
            {RECTOR_PHOTOS.map((p, i) => (
              <button key={p.file} type="button" onClick={() => setActive(i)} aria-pressed={i === active} aria-label={p.caption} className={cn('overflow-hidden rounded-xl border-2 transition', i === active ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100')}>
                <img src={photo(p.file)} alt="" className="aspect-square w-full object-cover object-top" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <SectionHeading index="04" eyebrow="Пастирське слово" title={<>Настоятель <br />і <em className="text-primary">храм</em></>} />
          <div className="reveal mt-10 space-y-6 text-[1.05rem] leading-[1.85] text-ink/80">
            <p className="font-display text-[1.65rem] leading-snug text-ink first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-[4.6rem] first-letter:leading-[0.8] first-letter:text-primary">
              Дорогі брати і сестри! Запрошую до спільної молитви у Петропавлівському храмі.
            </p>
            <p>У богослужінні єднаємося в подяці Богові, просимо миру Україні, сили нашим захисникам і підтримки кожному, хто її потребує.</p>
            <p>Парафіяльна сторінка називає храм святинею XIV століття. Він стоїть на вулиці Татарській у Старому місті Кам’янця-Подільського та залишається місцем молитви громади.</p>
            <div className={cn('grid transition-[grid-template-rows] duration-500', more ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
              <div className="space-y-6 overflow-hidden">
                <p>Сьогодні громада збирається тут на Божественну літургію, молиться за Україну, захисників і спочилих. Актуальні відомості про служби та парафіяльні події настоятель і громада публікують у Facebook.</p>
                <p className="text-sm text-muted-foreground">Історичну назву й датування храму наведено за офіційною сторінкою парафії.</p>
              </div>
            </div>
            <button type="button" onClick={() => setMore(!more)} aria-expanded={more} className="inline-flex items-center gap-2 border-b border-gold pb-1 text-sm font-bold text-primary">
              {more ? 'Згорнути літопис' : 'Читати літопис повністю'}
              <ChevronDown className={cn('size-4 transition-transform', more && 'rotate-180')} />
            </button>
          </div>
          <div className="reveal mt-12 flex items-center gap-5 border-t border-border pt-8">
            <p className="font-display text-3xl italic text-gold-deep">З молитвою,</p>
            <ExternalLink href={RECTOR_PAGE} className="text-primary">Звернення на Facebook отця Олександра</ExternalLink>
          </div>
        </div>
      </div>
    </section>
  )
}
