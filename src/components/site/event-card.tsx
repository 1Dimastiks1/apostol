import { ArrowUpRight, CalendarDays, Maximize2 } from 'lucide-react'
import { type ParishPost, safeHttpUrl, safeImageUrl, sanitizeRichHtml } from '@/lib/parish'

/** Картка події: одна й та сама на сайті та в попередньому перегляді адмінки */
export function EventCard({ post, onOpenPhoto, preview = false }: { post: ParishPost; onOpenPhoto?: () => void; preview?: boolean }) {
  // У попередньому перегляді фото може бути data: адресою з редактора
  const img = preview ? post.imageUrl || null : safeImageUrl(post.imageUrl)
  const href = safeHttpUrl(post.href)
  return (
    <article className={`spotlight group flex flex-col overflow-hidden rounded-3xl bg-card shadow-[0_18px_50px_-30px_rgba(74,15,18,.35)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-35px_rgba(74,15,18,.45)]`}>
      {img ? (
        <button type="button" onClick={onOpenPhoto} className="relative block w-full overflow-hidden" aria-label={`Відкрити фото: ${post.title}`}>
          {/* Пропорція 16:10 — така сама, як кадр «Як на сайті» в редакторі; повне фото відкривається на весь екран */}
          <img src={img} alt={post.title} loading="lazy" className="block aspect-[16/10] w-full object-cover transition duration-[1.2s] group-hover:scale-105" />
          <span className="absolute left-5 top-5 rounded-full bg-ivory/90 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-primary backdrop-blur">{post.type}</span>
          <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-night/70 px-3 py-1.5 text-xs font-semibold text-ivory backdrop-blur"><Maximize2 className="size-3.5" />На весь екран</span>
        </button>
      ) : (
        <div className="relative flex aspect-[16/10] items-end bg-gradient-to-br from-wine to-wine-deep p-6 text-ivory">
          <CalendarDays className="absolute right-6 top-6 size-7 text-gold/60" strokeWidth={1.3} />
          <span className="rounded-full bg-white/10 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-gold-light">{post.type}</span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-deep">{post.dateLabel}</p>
        <h3 className="mt-3 font-display text-[1.7rem] leading-tight text-ink">{post.title || 'Назва події'}</h3>
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
}
