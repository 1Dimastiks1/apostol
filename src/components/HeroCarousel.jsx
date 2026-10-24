import React, { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, ChevronRight, HeartHandshake, Landmark, Mail, Pause, Play } from 'lucide-react'

const parishPage = 'https://www.facebook.com/profile.php?id=100059029128700&locale=uk_UA'
const schedulePost = 'https://www.facebook.com/permalink.php?story_fbid=pfbid0wr4Gq5GgukTM1AWhKbAwocCBJEUns2HS39yzNCEGE4MLFctjx4joBaM6xLEXwQP3l&id=100059029128700'

const slides = [
  { eyebrow: 'СПІЛЬНА МОЛИТВА', title: 'Розклад богослужінь', intro: 'Дмитрівська поминальна субота · субота, 24 жовтня 2026 року.', type: 'schedule' },
  { eyebrow: 'ДУХОВНА СПАДЩИНА', title: 'Святині храму', intro: 'Світлини інтер’єру та парафіяльного життя — з офіційного фотоальбому Петропавлівської парафії.', type: 'sanctuary', photoId: '1456098993034391' },
  { eyebrow: 'МОЛИТВА Й ДОБРА СПРАВА', title: 'Підтримати храм', intro: 'Оберіть суму й перейдіть до офіційного допису парафії про пожертву на храм або панахиду.', type: 'donation' },
]

export default function HeroCarousel() {
  const [active, setActive] = useState(0)
  const [amount, setAmount] = useState(500)
  const [cause, setCause] = useState('храму')
  const [reducedMotion] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
  const [pausedByUser, setPausedByUser] = useState(reducedMotion)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const paused = pausedByUser || hovered || focused
  const slide = slides[active]
  const move = (direction) => setActive((current) => (current + direction + slides.length) % slides.length)

  useEffect(() => {
    if (paused) return undefined
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 5000)
    return () => window.clearInterval(timer)
  }, [paused])

  return <section id="home" className="sacred-hero relative overflow-hidden bg-[#3a0000] text-[#faf6ee]">
    <div className="sacred-hero__texture pointer-events-none absolute inset-0"/>
    <div className="relative mx-auto max-w-[1440px] px-5 py-12 sm:px-9 sm:py-16 lg:px-16 lg:py-20">
      <div className="mb-9 flex items-center gap-3 text-xs font-semibold uppercase tracking-[.24em] text-[#e5b842]"><span className="h-px w-10 bg-[#e5b842]"/>ПРАВОСЛАВНА ЦЕРКВА УКРАЇНИ</div>
      <div id="schedule" className="sacred-carousel relative grid min-h-[540px] overflow-hidden border border-[#e5b842]/55 bg-[#4a0000]/70 shadow-[0_30px_100px_rgba(0,0,0,.28)] lg:grid-cols-[.92fr_1.08fr]" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocus={(event) => { if (!event.target.closest('[data-carousel-play-pause]')) setFocused(true) }} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget) || event.relatedTarget?.closest('[data-carousel-play-pause]')) setFocused(false) }}>
        <div className="absolute inset-3 border border-[#e5b842]/20 pointer-events-none sm:inset-4"/>
        <div className="relative z-10 flex flex-col justify-center px-7 py-12 pb-20 sm:px-12 lg:px-16">
          <p key={`eyebrow-${active}`} className="fade-in text-xs font-semibold uppercase tracking-[.22em] text-[#e5b842]">{slide.eyebrow}</p>
          <h1 key={`title-${active}`} className="font-display fade-in mt-5 max-w-2xl text-5xl font-medium uppercase leading-[.98] tracking-[.04em] text-[#faf6ee] sm:text-6xl lg:text-7xl">{slide.title}</h1>
          <p key={`intro-${active}`} className="fade-in mt-6 max-w-xl text-lg leading-8 text-[#eadfca] sm:text-xl">{slide.intro}</p>

          {slide.type === 'schedule' && <div className="mt-8 max-w-xl border border-[#e5b842]/60 bg-[#3a0000]/55 p-4 sm:p-5">
            <div className="grid grid-cols-[1fr_auto] gap-x-5 border-b border-[#e5b842]/30 pb-3 text-[10px] font-semibold uppercase tracking-[.16em] text-[#e5b842]"><span>Богослужіння</span><span>Час</span></div>
            <div className="grid grid-cols-[1fr_auto] items-center gap-x-5 border-b border-[#e5b842]/20 py-4"><span className="text-sm text-[#faf6ee] sm:text-base">Сповідь</span><span className="text-sm font-semibold text-[#e5b842]">08:30</span></div>
            <div className="grid grid-cols-[1fr_auto] items-center gap-x-5 py-4"><span className="text-sm text-[#faf6ee] sm:text-base">Служба Божа</span><span className="text-sm font-semibold text-[#e5b842]">09:00</span></div>
            <a href={schedulePost} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-xs text-[#eadfca] transition hover:text-[#e5b842]"><CalendarDays size={14}/>Допис парафії та поминання у коментарях</a>
          </div>}

          {slide.type === 'donation' && <div className="mt-8 max-w-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[.16em] text-[#e5b842]">Яку ініціативу підтримати?</p>
            <div className="mb-4 flex flex-wrap gap-2">{[['храм','На храм'],['панахида','На панахиду']].map(([value,label]) => <button key={value} type="button" onClick={() => setCause(value)} aria-pressed={cause === value} className={`border px-4 py-2 text-xs transition ${cause === value ? 'border-[#e5b842] bg-[#e5b842] text-[#3a0000]' : 'border-[#e5b842]/45 text-[#faf6ee] hover:border-[#e5b842]'}`}>{label}</button>)}</div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[.16em] text-[#e5b842]">Оберіть орієнтовну суму · грн</p>
            <div className="flex flex-wrap gap-2">{[100, 250, 500, 1000].map((value) => <button key={value} type="button" onClick={() => setAmount(value)} aria-pressed={amount === value} className={`border px-4 py-2.5 text-sm transition ${amount === value ? 'border-[#e5b842] bg-[#e5b842] text-[#3a0000]' : 'border-[#e5b842]/45 text-[#faf6ee] hover:border-[#e5b842]'}`}>{value} ₴</button>)}</div>
            <a href={schedulePost} target="_blank" rel="noreferrer" className="candle-glow mt-4 inline-flex items-center gap-2 bg-[#e5b842] px-5 py-3 text-sm font-semibold text-[#3a0000] transition hover:bg-[#f3d578]"><HeartHandshake size={17}/>Підтримати: {cause}, {amount} ₴ · умови у Facebook</a>
            <p className="mt-3 text-xs leading-5 text-[#cdbd9c]">Вибір суми не проводить оплату. Умови пожертви опубліковані в дописі офіційної сторінки.</p>
          </div>}

          {slide.type === 'sanctuary' && <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#eadfca]"><span className="inline-flex items-center gap-2"><Landmark size={15} className="text-[#e5b842]"/>Публікації парафії</span><a href={`${parishPage}&sk=photos`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#e5b842] hover:text-white">Відкрити фотоальбом<ChevronRight size={14}/></a></div>}

          <div className="mt-9 flex items-center gap-5"><a href="#prayer" className="inline-flex items-center gap-2 text-sm font-medium text-[#e5b842] transition hover:text-white">Поминання та пожертви<ChevronRight size={15}/></a><a href="https://www.facebook.com/profile.php?id=100059029128700&locale=uk_UA" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[#eadfca] transition hover:text-white"><Mail size={15}/>Зв’язатися з парафією</a></div>
        </div>

        <div className="relative min-h-[320px] overflow-hidden border-t border-[#e5b842]/30 lg:min-h-full lg:border-l lg:border-t-0">
          {slide.type === 'sanctuary' ? <iframe title="Світлина з альбому Петропавлівської парафії у Facebook" src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(`https://www.facebook.com/photo/?fbid=${slide.photoId}&set=pb.100059029128700.-2207520000`)}&show_text=false&width=700`} className="absolute inset-0 h-full w-full border-0 bg-[#250000]" scrolling="no"/> : <div className={`absolute inset-0 ${slide.type === 'schedule' ? 'slide-arch-bg' : 'slide-donation-bg'}`} aria-hidden="true"/>}
          <div className="absolute inset-0 bg-gradient-to-t from-[#210000]/80 via-[#3a0000]/10 to-[#3a0000]/15 lg:bg-gradient-to-r lg:from-[#3a0000]/25 lg:via-transparent lg:to-[#210000]/35"/>
          {slide.type === 'sanctuary' && <div className="absolute inset-x-5 bottom-5 border border-[#e5b842]/60 bg-[#3a0000]/80 p-4 backdrop-blur-sm sm:inset-x-8 sm:bottom-8 sm:p-5"><p className="font-display text-xl uppercase tracking-[.1em] text-[#f4df9c]">Пам’ятка архітектури</p><p className="mt-1 text-xs text-[#eadfca]">Татарська вулиця, 9 · Кам’янець-Подільський</p></div>}
          {slide.type === 'schedule' && <div className="absolute bottom-8 left-8 right-8 hidden border-l border-[#e5b842] pl-5 lg:block"><p className="font-display text-3xl uppercase tracking-[.08em] text-[#f4df9c]">«Блаженні ті,<br/>що слухають слово Боже»</p><p className="mt-2 text-xs tracking-wide text-[#eadfca]">Лк. 11:28</p></div>}
          {slide.type === 'donation' && <div className="absolute inset-0 flex items-center justify-center"><div className="donation-emblem grid size-52 place-items-center rounded-full border border-[#e5b842]/65 text-center sm:size-64"><div className="grid size-[86%] place-items-center rounded-full border border-[#e5b842]/35"><div><HeartHandshake className="mx-auto mb-3 text-[#e5b842]" size={34} strokeWidth={1.2}/><p className="font-display text-2xl uppercase tracking-[.12em] text-[#faf6ee]">На храм</p><p className="mt-1 text-[10px] uppercase tracking-[.2em] text-[#e5b842]">Добровільна підтримка</p></div></div></div></div>}
        </div>
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 sm:bottom-6 sm:right-6"><span className="mr-2 text-[10px] tracking-[.2em] text-[#eadfca]">0{active + 1} / 03</span><button type="button" data-carousel-play-pause onClick={() => setPausedByUser((value) => !value)} aria-label={pausedByUser ? 'Увімкнути автопрокрутку' : 'Зупинити автопрокрутку'} className="carousel-arrow">{pausedByUser ? <Play size={16}/> : <Pause size={16}/>}</button><button type="button" onClick={() => move(-1)} aria-label="Попередній слайд" className="carousel-arrow"><ArrowLeft size={18}/></button><button type="button" onClick={() => move(1)} aria-label="Наступний слайд" className="carousel-arrow"><ArrowRight size={18}/></button></div>
      </div>
      <div className="mt-5 flex justify-center gap-2">{slides.map((item, index) => <button key={item.title} type="button" aria-label={`Перейти до слайду ${index + 1}: ${item.title}`} aria-current={active === index ? 'true' : undefined} onClick={() => setActive(index)} className={`h-1 transition-all ${active === index ? 'w-12 bg-[#e5b842]' : 'w-6 bg-[#e5b842]/35 hover:bg-[#e5b842]/70'}`}/>)}</div>
    </div>
  </section>
}
