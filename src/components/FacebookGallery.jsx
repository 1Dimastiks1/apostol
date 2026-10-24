import React, { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Facebook, Images, ChevronLeft, ChevronRight, X } from 'lucide-react'

const pageUrl = 'https://www.facebook.com/profile.php?id=100059029128700&locale=uk_UA'
const schedulePost = 'https://www.facebook.com/permalink.php?story_fbid=pfbid0wr4Gq5GgukTM1AWhKbAwocCBJEUns2HS39yzNCEGE4MLFctjx4joBaM6xLEXwQP3l&id=100059029128700'
const photoAlbum = 'https://www.facebook.com/profile.php?id=100059029128700&sk=photos'
const photos = [
  { id: '1458624966115127', date: '21 жовтня 2026', title: 'Дмитрівська поминальна субота', description: 'Запрошення до спільної молитви за спочилих рідних і полеглих захисників України.', set: 'pb.100059029128700.-2207520000' },
  { id: '1456098993034391', date: '18 жовтня 2026', title: 'Божественна літургія', description: 'Молитва за Україну, воїнів і спочилих — фотоальбом парафії.', set: 'pb.100059029128700.-2207520000' },
]

const photoUrl = ({ id, set }) => `https://www.facebook.com/photo/?fbid=${id}&set=${set}`
const embedUrl = (photo) => `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(photoUrl(photo))}&show_text=false&width=600`

export default function FacebookGallery() {
  const [selected, setSelected] = useState(null)
  const dialogRef = useRef(null)
  const openerRef = useRef(null)
  const isOpen = selected !== null
  const pagePlugin = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(pageUrl)}&tabs=timeline&width=1000&height=620&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`

  useEffect(() => {
    if (!isOpen) return undefined
    const focusFrame = window.requestAnimationFrame(() => dialogRef.current?.focus())
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setSelected(null)
      if (event.key === 'ArrowRight') setSelected((current) => (current + 1) % photos.length)
      if (event.key === 'ArrowLeft') setSelected((current) => (current - 1 + photos.length) % photos.length)
      if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll('button:not([disabled]), a[href]')
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (document.activeElement === dialogRef.current) { event.preventDefault(); (event.shiftKey ? last : first).focus() }
        else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      openerRef.current?.focus()
    }
  }, [isOpen])

  return <section id="gallery" className="bg-[#3a0000] px-5 py-20 text-[#faf6ee] sm:px-9 sm:py-28 lg:px-16">
    <div className="mx-auto max-w-[1440px]">
      <div className="flex flex-col justify-between gap-6 border-b border-[#e5b842]/45 pb-7 sm:flex-row sm:items-end"><div><p className="eyebrow !text-[#e5b842]">ПЕТРОПАВЛІВСЬКА ПАРАФІЯ · FACEBOOK</p><h2 className="font-display mt-3 text-4xl uppercase tracking-[.05em] text-[#faf6ee] sm:text-5xl">Світлини парафії</h2><p className="mt-4 max-w-2xl text-base leading-7 text-[#eadfca] sm:text-lg">Публікації та фото з офіційного профілю Петропавлівської парафії.</p></div><a href={photoAlbum} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#e5b842] transition hover:text-white"><Facebook size={17}/>Відкрити фотоальбом<ArrowUpRight size={15}/></a></div>
      <div className="photo-grid mt-8">{photos.map((photo, index) => <article key={photo.id} className={`photo-tile photo-tile-${index + 1} group relative min-h-[240px] overflow-hidden border border-[#e5b842]/65 bg-[#250000]`}>
        <iframe title={`${photo.title}, ${photo.date} — Facebook`} src={embedUrl(photo)} width="600" height="680" scrolling="no" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" className="absolute left-1/2 top-1/2 h-[680px] w-[600px] max-w-none -translate-x-1/2 -translate-y-1/2 scale-[.82] origin-center"/>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#3a0000]/95 via-[#3a0000]/15 to-transparent opacity-75 transition duration-300 group-hover:opacity-100"/>
        <div className="pointer-events-none absolute inset-2 border border-[#e5b842]/35 transition duration-300 group-hover:inset-3 group-hover:border-[#e5b842]/80"/>
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6"><span className="text-[10px] uppercase tracking-[.18em] text-[#e5b842]">{photo.date}</span><h3 className="font-display mt-2 text-xl uppercase tracking-[.08em] text-[#faf6ee] sm:text-2xl">{photo.title}</h3><button type="button" onClick={(event) => { openerRef.current = event.currentTarget; setSelected(index) }} aria-label={`Відкрити світлину: ${photo.title}`} className="pointer-events-auto mt-3 inline-flex items-center gap-1 text-xs text-[#eadfca] transition hover:text-[#e5b842]">Відкрити у перегляді<ArrowUpRight size={13}/></button></div>
      </article>)}</div>

      <div className="mt-12 grid gap-7 lg:grid-cols-[.65fr_1.35fr] lg:items-center">
        <div><div className="flex items-center gap-3 text-[#e5b842]"><Images size={19}/><p className="text-xs font-semibold uppercase tracking-[.18em]">Актуальне оголошення</p></div><h3 className="font-display mt-4 text-3xl uppercase tracking-[.06em] text-[#faf6ee]">Дмитрівська поминальна субота</h3><p className="mt-4 text-base leading-7 text-[#eadfca]">Сповідь — 08:30. Служба Божа — 09:00, 24 жовтня. У дописі парафія просить подавати записки за упокій у коментарях.</p><a href={schedulePost} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#e5b842] hover:text-white">Переглянути оригінальний допис<ArrowUpRight size={15}/></a></div>
        <div className="overflow-hidden border border-[#e5b842]/50 bg-[#faf6ee] p-2 sm:p-3"><iframe title="Останні публікації Петропавлівської парафії у Facebook" src={pagePlugin} width="100%" height="480" style={{border:0,overflow:'hidden'}} scrolling="no" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"/></div>
      </div>
      <p className="mt-4 text-xs leading-5 text-[#cdbd9c]">Два актуальні дописи та стрічка завантажуються безпосередньо з Facebook. Добірка показує окремі публікації, а не повторює ті самі знімки альбому.</p>
    </div>

    {selected !== null && <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Перегляд публікації Facebook" className="fixed inset-0 z-[100] flex items-center justify-center bg-[#140000]/95 p-4 outline-none backdrop-blur-sm sm:p-8" onClick={() => setSelected(null)}>
      <button type="button" onClick={() => setSelected(null)} aria-label="Закрити перегляд" className="absolute right-4 top-4 z-20 grid size-12 place-items-center border border-[#e5b842]/60 bg-[#3a0000] text-[#e5b842] transition hover:bg-[#e5b842] hover:text-[#3a0000]"><X size={22}/></button>
      <button type="button" onClick={(event) => { event.stopPropagation(); setSelected((selected - 1 + photos.length) % photos.length) }} aria-label="Попереднє фото" className="absolute left-3 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center border border-[#e5b842]/60 bg-[#3a0000]/90 text-[#e5b842] transition hover:bg-[#e5b842] hover:text-[#3a0000] sm:left-8"><ChevronLeft size={24}/></button>
      <div className="relative flex max-h-full w-full max-w-3xl flex-col items-center" onClick={(event) => event.stopPropagation()}><iframe title={`${photos[selected].title} — Facebook`} src={`${embedUrl(photos[selected])}&width=800`} width="100%" height="min(76vh, 820px)" className="h-[76vh] max-h-[820px] w-full border border-[#e5b842]/75 bg-[#faf6ee]" scrolling="yes" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"/><a href={photoUrl(photos[selected])} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-[#e5b842] hover:text-white">Відкрити оригінал у Facebook<ArrowUpRight size={13}/></a></div>
      <button type="button" onClick={(event) => { event.stopPropagation(); setSelected((selected + 1) % photos.length) }} aria-label="Наступне фото" className="absolute right-3 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center border border-[#e5b842]/60 bg-[#3a0000]/90 text-[#e5b842] transition hover:bg-[#e5b842] hover:text-[#3a0000] sm:right-8"><ChevronRight size={24}/></button>
    </div>}
  </section>
}
