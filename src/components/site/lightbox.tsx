import { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export type LightboxItem = { src: string; title: string; href?: string; hrefLabel?: string }

type Props = { items: LightboxItem[]; index: number | null; onChange: (i: number | null) => void }

export function Lightbox({ items, index, onChange }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const open = index !== null && items.length > 0
  const go = (delta: number) => index !== null && onChange((index + delta + items.length) % items.length)

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChange(null)
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; prev?.focus?.() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index])

  if (!open) return null
  const item = items[index]
  return (
    <div role="dialog" aria-modal="true" aria-label={item.title} className="fixed inset-0 z-[100] flex flex-col bg-night/95 p-4 backdrop-blur-md sm:p-8" onClick={(e) => e.target === e.currentTarget && onChange(null)}>
      <div className="flex items-center justify-between gap-4 text-ivory">
        <p className="font-display text-xl sm:text-2xl">{item.title}</p>
        <button ref={closeRef} type="button" onClick={() => onChange(null)} aria-label="Закрити" className="grid size-11 place-items-center rounded-full border border-white/20 hover:border-gold"><X className="size-5" /></button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center py-6" onClick={(e) => e.target === e.currentTarget && onChange(null)}>
        <img src={item.src} alt={item.title} className="max-h-full max-w-full rounded-xl object-contain shadow-2xl" />
      </div>
      <div className="flex items-center justify-between gap-4 text-ivory">
        <button type="button" onClick={() => go(-1)} aria-label="Попереднє фото" className="grid size-12 place-items-center rounded-full border border-white/20 hover:border-gold"><ChevronLeft /></button>
        {item.href ? <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gold-light hover:underline">{item.hrefLabel || 'Відкрити оригінал'} ↗</a> : <span className="text-sm text-ivory/50">{index + 1} / {items.length}</span>}
        <button type="button" onClick={() => go(1)} aria-label="Наступне фото" className="grid size-12 place-items-center rounded-full border border-white/20 hover:border-gold"><ChevronRight /></button>
      </div>
    </div>
  )
}
