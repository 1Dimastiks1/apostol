import { useMemo, useState } from 'react'
import { ArrowUpRight, CalendarDays } from 'lucide-react'
import type { ParishPost } from '@/lib/parish'
import { PARISH_PAGE, safeHttpUrl, safeImageUrl, sanitizeRichHtml } from '@/lib/parish'
import { ExternalLink, SectionHeading } from './section-heading'
import { Lightbox, type LightboxItem } from './lightbox'

const FILTERS = [
  ['all', 'Усі події'],
  ['schedule', 'Розклад служб'],
  ['volunteer', 'Волонтерство'],
] as const

type Filter = (typeof FILTERS)[number][0]

const matches = (post: ParishPost, filter: Filter) =>
  filter === 'all' ||
  (filter === 'schedule' && (post.category === 'schedule' || post.category === 'service')) ||
  (filter === 'volunteer' && post.category === 'volunteer')

export function News({ posts }: { posts: ParishPost[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [photoIndex, setPhotoIndex] = useState<number | null>(null)
  const visible = posts.filter((p) => matches(p, filter))

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
          {FILTERS.map(([key, label]) => (
            <button key={key} type="button" className="chip" aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>
          ))}
        </div>

        {visible.length ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
            {visible.map((post, i) => {
              const img = safeImageUrl(post.imageUrl)
              const href = safeHttpUrl(post.href)
              const featured = i === 0 && visible.length > 2
              return (
                <article key={post.id} className={`reveal spotlight group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-35px_rgba(74,15,18,.45)] ${featured ? 'md:col-span-2 lg:row-span-2' : ''}`}>
                  {img ? (
                    <button type="button" onClick={() => setPhotoIndex(photos.findIndex((p) => p.id === post.id))} className="relative overflow-hidden" aria-label={`Відкрити фото: ${post.title}`}>
                      <img src={img} alt={post.title} loading="lazy" className={`w-full object-cover transition duration-[1.2s] group-hover:scale-105 ${featured ? 'aspect-[16/10]' : 'aspect-[16/11]'}`} />
                      <span className="absolute left-5 top-5 rounded-full bg-ivory/90 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-primary backdrop-blur">{post.type}</span>
                    </button>
                  ) : (
                    <div className="relative flex aspect-[16/9] items-end bg-gradient-to-br from-wine to-wine-deep p-6 text-ivory">
                      <CalendarDays className="absolute right-6 top-6 size-7 text-gold/60" strokeWidth={1.3} />
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-gold-light">{post.type}</span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-7">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-deep">{post.dateLabel}</p>
                    <h3 className={`mt-3 font-display leading-tight text-ink ${featured ? 'text-4xl' : 'text-[1.7rem]'}`}>{post.title}</h3>
                    {post.rich
                      ? <div className="rich mt-3 leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(post.text) }} />
                      : <p className="mt-3 leading-relaxed text-muted-foreground">{post.text}</p>}
                    {href && (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-bold text-primary">
                        {post.rich ? 'Перейти до ефіру / посилання' : 'Відкрити допис'} <ArrowUpRight className="size-4" />
                      </a>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="mt-10 rounded-3xl border border-dashed border-gold/40 p-10 text-center text-muted-foreground">
            За цим фільтром немає свіжих дописів. Перегляньте всі публікації на <a className="font-semibold text-primary underline" href={PARISH_PAGE} target="_blank" rel="noopener noreferrer">сторінці парафії</a>.
          </p>
        )}
      </div>
      <Lightbox items={photos} index={photoIndex} onChange={setPhotoIndex} />
    </section>
  )
}
