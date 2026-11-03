import { useState } from 'react'
import { Expand } from 'lucide-react'
import { PARISH_ALBUMS, photo } from '@/lib/parish'
import { cn } from '@/lib/utils'
import { ExternalLink, SectionHeading } from './section-heading'
import { Lightbox, type LightboxItem } from './lightbox'

// Світлини самої парафії — фасад, дзвіниця й богослужіння
const PARISH: (LightboxItem & { span: string })[] = [
  { src: photo('church-exterior-old-town.jpg'), title: 'Фасад і дзвіниця серед мурів Старого міста', href: 'https://www.facebook.com/photo/?fbid=126234522687518&set=a.104140021563635', hrefLabel: 'Оригінал у Facebook', span: 'md:col-span-2 md:row-span-2' },
  { src: photo('parish/iconostasis-gold.jpg'), title: 'Різьблений позолочений іконостас', span: 'md:col-span-2' },
  { src: photo('parish/liturgy-mitre.jpg'), title: 'Під час Божественної літургії', span: '' },
  { src: photo('parish/courtyard-monument.jpg'), title: 'Подвір’я біля входу до храму', span: '' },
  { src: photo('parish/interior-nave.jpg'), title: 'Світлий неф і золото іконостаса', span: 'md:row-span-2' },
  { src: photo('rector-liturgy-reading.jpg'), title: 'Читання за богослужінням', span: 'md:row-span-2' },
  { src: photo('parish/bell-tower-gate.jpg'), title: 'Кам’яна брама й дзвіниця', span: 'md:row-span-2' },
  { src: photo('parish/analoy-gospel.jpg'), title: 'Євангеліє та хрест на аналої', span: 'md:row-span-2' },
  { src: photo('parish/garden-swing.jpg'), title: 'Затишне подвір’я храму', span: 'md:col-span-2' },
  { src: photo('parish/gate-cross.jpg'), title: 'Брама з хрестом, оповита плющем', span: 'md:col-span-2' },
  { src: photo('parish/apse-spruce.jpg'), title: 'Храм у зелені й трояндах', span: 'md:row-span-2' },
  { src: photo('rector-liturgy-gospel.jpg'), title: 'Урочисте винесення Євангелія', span: 'md:row-span-2' },
  { src: photo('parish/paschal-liturgy.jpg'), title: 'Пасхальне богослужіння', span: 'md:row-span-2' },
  { src: photo('parish/military-priest.jpg'), title: 'Військовий священник', span: 'md:row-span-2' },
]

export function Gallery() {
  const [index, setIndex] = useState<number | null>(null)
  return (
    <section id="gallery" className="bg-parchment py-28 sm:py-36">
      <div className="shell">
        <SectionHeading
          index="05"
          eyebrow="Фотолітопис парафії"
          title={<>Петропавлівський <em className="text-primary">храм</em></>}
          lead="Фасад, дзвіниця й богослужіння — світлини з офіційних альбомів парафії."
          aside={<ExternalLink href={PARISH_ALBUMS} className="text-primary">Усі фотоальбоми</ExternalLink>}
        />

        <div className="mt-10 grid grid-cols-2 gap-2.5 sm:mt-14 sm:gap-4 mx-auto max-w-5xl md:auto-rows-[150px] md:grid-flow-dense md:grid-cols-4">
          {PARISH.map((p, i) => (
            <button key={p.src} type="button" onClick={() => setIndex(i)} className={cn('reveal-clip group relative isolate overflow-hidden rounded-2xl bg-wine-deep text-left [transform:translateZ(0)] md:aspect-auto', p.span.includes('col-span-2') ? 'col-span-2 aspect-[16/10] md:col-span-1' : 'aspect-[3/4]', p.span)} aria-label={`Відкрити фото: ${p.title}`}>
              <img src={p.src} alt={p.title} loading="lazy" className="size-full transform-gpu object-cover object-[50%_25%] transition-transform duration-700 ease-out will-change-transform group-hover:scale-105" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/85 via-night/10 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
              <span className="pointer-events-none absolute inset-x-3 bottom-3 font-display text-[0.95rem] leading-tight text-ivory sm:bottom-3.5 sm:left-4 sm:right-10 sm:text-base">{p.title}</span>
              <Expand className="pointer-events-none absolute bottom-5 right-5 hidden size-5 sm:block text-gold-light opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>
      <Lightbox items={PARISH} index={index} onChange={setIndex} />
    </section>
  )
}
