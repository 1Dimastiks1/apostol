import { useState } from 'react'
import { Bus, Car, Copy, Footprints, MapPin, Phone } from 'lucide-react'
import { LiquidButton } from '@/components/ui/liquid-glass-button'
import { ADDRESS, MAPS_EMBED, MAPS_URL, PARISH_PAGE, PHONE, PHONE_LABEL, RECTOR_PAGE, copyText } from '@/lib/parish'
import { ExternalLink, SectionHeading } from './section-heading'

const ROUTES = [
  { icon: Footprints, title: 'Пішки від Ратуші', text: 'Лише 300 метрів (3–4 хвилини). Від Ратуші прямуйте вулицею Зарванською або П’ятницькою до перетину з Татарською.' },
  { icon: Car, title: 'Автомобілем', text: 'Заїзд у Старе місто через Новопланівський міст. Паркування на вулиці Татарській або біля Польського ринку.' },
  { icon: Bus, title: 'Громадським транспортом', text: 'Маршрутки № 1 та № 7 до зупинки «Старе місто / Ратуша», далі 300 метрів пішки.' },
]

export function Contacts() {
  const [status, setStatus] = useState('')
  return (
    <section id="contacts" className="bg-ivory py-28 sm:py-36">
      <div className="shell">
        <SectionHeading index="13" eyebrow="Завітайте до храму" title={<>Контакти <em className="text-primary">та дорога</em></>} />
        <div className="mt-16 grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <div className="reveal space-y-10">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div>
                <p className="flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-gold-deep"><MapPin className="size-4" />Адреса</p>
                <p className="mt-3 font-display text-3xl leading-tight text-ink">Татарська, 9</p>
                <p className="mt-1 text-muted-foreground">Кам’янець-Подільський, Старе місто</p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-gold-deep"><Phone className="size-4" />Настоятель о. Олександр</p>
                <a href={`tel:${PHONE}`} className="mt-3 block font-display text-3xl leading-tight text-ink hover:text-primary">{PHONE_LABEL}</a>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-night p-3 pl-5">
              <button type="button" onClick={async () => setStatus((await copyText(ADDRESS)) ? 'Адресу скопійовано' : 'Не вдалося скопіювати')} className="inline-flex items-center gap-2 text-sm font-semibold text-ivory/80 hover:text-ivory"><Copy className="size-4" />Копіювати адресу</button>
              <LiquidButton size="lg" className="ml-auto rounded-full text-ivory" onClick={() => window.open(MAPS_URL, '_blank', 'noopener,noreferrer')}>Маршрут у Google Maps</LiquidButton>
            </div>
            {status && <p role="status" className="-mt-6 text-sm text-primary">{status}</p>}
            <ul className="space-y-6 border-t border-border pt-10">
              {ROUTES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-5">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full border border-gold/40 text-gold-deep"><Icon className="size-5" strokeWidth={1.5} /></span>
                  <div><p className="font-display text-xl text-ink">{title}</p><p className="mt-1 leading-relaxed text-muted-foreground">{text}</p></div>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <ExternalLink href={PARISH_PAGE} className="text-primary">Facebook парафії</ExternalLink>
              <ExternalLink href={RECTOR_PAGE} className="text-primary">Facebook настоятеля</ExternalLink>
            </div>
          </div>
          <div className="reveal overflow-hidden rounded-[2rem] border border-gold/30 shadow-[0_40px_100px_-60px_rgba(74,15,18,.6)]">
            <iframe title="Карта до храму на вулиці Татарській, 9 у Кам’янці-Подільському" loading="lazy" src={MAPS_EMBED} className="h-full min-h-[460px] w-full grayscale-[35%] sepia-[15%]" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </div>
    </section>
  )
}
