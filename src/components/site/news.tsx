import { useMemo, useState } from 'react'
import type { ParishPost } from '@/lib/parish'
import { EVENT_CATEGORIES, PARISH_PAGE, safeImageUrl, safeHttpUrl } from '@/lib/parish'
import { ExternalLink, SectionHeading } from './section-heading'
import { EventCard } from './event-card'
import { Lightbox, type LightboxItem } from './lightbox'

const matches = (post: ParishPost, filter: string) => filter === 'all' || post.category === filter

export function News({ posts }: { posts: ParishPost[] }) {
  const [filter, setFilter] = useState<string>('all')
  const [photoIndex, setPhotoIndex] = useState<number | null>(null)
  // Усі позначки з адмінки показуються завжди, щоб фільтр на сайті збігався з вибором у формі події
  const filters: (readonly [string, string])[] = [['all', 'Усі події'], ...EVENT_CATEGORIES]
  const active = filter
  const visible = posts.filter((p) => matches(p, active))

  const photos: (LightboxItem & { id: string })[] = useMemo(() => visible.flatMap((p) => {
    const src = safeImageUrl(p.imageUrl)
    return src ? [{ id: p.id, src, title: `${p.dateLabel} · ${p.title}`, href: safeHttpUrl(p.href) || undefined, hrefLabel: 'Відкрити допис' }] : []
  }), [visible])

  return (
    <section id="news" className="bg-ivory py-28 sm:py-36">
      <div className="shell">
        <SectionHeading
          index="06"
          eyebrow="Життя парафії"
          title={<>Події та <em className="text-primary">оголошення</em></>}
          lead="Оголошення громади, розклад служб і світлини — з адмінки сайту та офіційної сторінки парафії."
          aside={<ExternalLink href={PARISH_PAGE} className="text-primary">Усі дописи у Facebook</ExternalLink>}
        />

        <div className="reveal mt-12 flex flex-wrap gap-2" role="group" aria-label="Фільтр подій">
          {filters.map(([key, label]) => (
            <button key={key} type="button" className="chip" aria-pressed={active === key} onClick={() => setFilter(key)}>{label}</button>
          ))}
        </div>

        {visible.length ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
            {visible.map((post) => (
              <div key={post.id} className="reveal flex flex-col [&>article]:h-full">
                <EventCard post={post} onOpenPhoto={() => setPhotoIndex(photos.findIndex((p) => p.id === post.id))} />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-10 rounded-3xl border border-dashed border-gold/40 p-10 text-center text-muted-foreground">
            Під позначкою «{filters.find(([k]) => k === active)?.[1]}» поки немає подій. Перегляньте всі публікації на <a className="font-semibold text-primary underline" href={PARISH_PAGE} target="_blank" rel="noopener noreferrer">сторінці парафії</a>.
          </p>
        )}
      </div>
      <Lightbox items={photos} index={photoIndex} onChange={setPhotoIndex} />
    </section>
  )
}
