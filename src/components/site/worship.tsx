import { Play } from 'lucide-react'
import type { Stream } from '@/lib/parish'
import { RECTOR_PAGE, RECTOR_VIDEOS, embedUrl, formatDate, safeHttpUrl } from '@/lib/parish'
import { ExternalLink, SectionHeading } from './section-heading'
import { cn } from '@/lib/utils'

const label = (s: Stream) => s.dateLabel || formatDate(s.date || s.createdAt)

function VideoFrame({ stream, className }: { stream: Stream; className?: string }) {
  const src = embedUrl(stream.videoUrl)
  return (
    <div className={cn('video-frame', className)}>
      {src
        ? <iframe title={stream.title || 'Трансляція богослужіння'} loading="lazy" src={src} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen />
        : <div className="grid size-full place-items-center text-ivory/50"><Play /></div>}
    </div>
  )
}

export function Worship({ current, archive, syncStatus }: { current: Stream | null; archive: Stream[]; syncStatus: string }) {
  const live = Boolean(current?.isLive)
  return (
    <section id="online" className="grain relative isolate overflow-hidden bg-night py-28 text-ivory sm:py-36">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[1100px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(90,20,24,.55),transparent_65%)]" aria-hidden="true" />
      <div className="shell">
        <SectionHeading
          dark
          index="02"
          eyebrow="Прямі трансляції"
          title={<>Богослужіння <em className="gold-text">онлайн</em></>}
          lead={<>Моліться разом із громадою, де б ви не були. <span className="text-ivory/50">{syncStatus}</span></>}
          aside={<ExternalLink href={RECTOR_VIDEOS} className="text-gold-light">Усі відео на Facebook</ExternalLink>}
        />

        {current ? (
          <div className="reveal mt-16 grid overflow-hidden rounded-3xl border border-white/10 bg-white/[.03] lg:grid-cols-[1.45fr_1fr]">
            <VideoFrame stream={current} />
            <div className="flex flex-col justify-between gap-8 p-8 sm:p-10">
              <div>
                <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em]', live ? 'bg-red-600 text-white' : 'bg-white/10 text-ivory/80')} role="status">
                  <span className={cn('size-1.5 rounded-full', live ? 'animate-flicker bg-white' : 'bg-gold')} />
                  {live ? 'Пряма трансляція' : 'Останній запис'}
                </span>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.24em] text-gold-light/80">{label(current)}</p>
                <h3 className="mt-3 font-display text-[2.2rem] leading-[1.05]">{current.title || 'Богослужіння у Петропавлівському храмі'}</h3>
                {current.description && <p className="mt-4 leading-relaxed text-ivory/65">{current.description}</p>}
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {safeHttpUrl(current.videoUrl) && <ExternalLink href={safeHttpUrl(current.videoUrl)!} className="text-gold-light">{live ? 'Дивитися наживо' : 'Відкрити запис'}</ExternalLink>}
                <ExternalLink href={RECTOR_PAGE} className="text-ivory/70">Сторінка настоятеля</ExternalLink>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-16 rounded-3xl border border-white/10 p-10 text-center text-ivory/60">За останні 14 днів записів немає. Нові трансляції з’являться тут автоматично.</p>
        )}

        {archive.length > 0 && (
          <>
            <div className="mt-20 flex items-end justify-between border-b border-white/10 pb-5">
              <h3 className="font-display text-3xl">Архів служб</h3>
              <span className="text-xs text-ivory/45">Для перегляду може знадобитися вхід у Facebook</span>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {archive.map((s) => (
                <article key={s.id} className="reveal spotlight group overflow-hidden rounded-2xl border border-white/10 bg-white/[.03] transition hover:border-gold/40">
                  <VideoFrame stream={s} />
                  <div className="p-6">
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-gold-light/70">{s.isLive ? 'Наживо' : label(s)}</p>
                    <h4 className="mt-2 font-display text-xl">{s.title || 'Запис богослужіння'}</h4>
                    {s.description && <p className="mt-2 line-clamp-2 text-sm text-ivory/55">{s.description}</p>}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
