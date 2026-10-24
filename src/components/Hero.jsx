import React from 'react'
import { ArrowDown, ArrowRight, CalendarDays, Clock3, MapPin } from 'lucide-react'

const services = [
  { day: 'Неділя', title: 'Божественна літургія', time: '09:00', note: 'Щотижневе богослужіння' },
  { day: 'Субота', title: 'Вечірнє богослужіння', time: '17:00', note: 'Напередодні неділі' },
  { day: 'За церковним календарем', title: 'Святкова літургія', time: '09:00', note: 'У дні великих свят' },
]

function CrossMark({ className = '' }) {
  return <svg aria-hidden="true" className={className} viewBox="0 0 32 42" fill="none">
    <path d="M16 2v38M7 12h18M10 19h12M16 2l-3 4m3-4 3 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
}

function ArchFrame({ className = '' }) {
  return <svg aria-hidden="true" className={className} viewBox="0 0 360 480" fill="none" preserveAspectRatio="none">
    <path d="M18 478V181C18 91 90 18 180 18s162 73 162 163v297M34 478V181c0-81 65-146 146-146s146 65 146 146v297" stroke="currentColor" strokeWidth="1" />
    <path d="M180 3v29m-8-20h16m-14 5h12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <circle cx="180" cy="18" r="3" fill="currentColor" />
  </svg>
}

export default function Hero() {
  return <>
    <section id="home" className="hero-section relative overflow-hidden bg-[#4a0000] text-[#f5f0e4]">
      <div className="hero-grain pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative mx-auto grid min-h-[630px] max-w-7xl items-center gap-10 px-6 py-14 sm:px-10 sm:py-20 lg:grid-cols-[1fr_.8fr] lg:gap-12 lg:px-16">
        <div className="relative z-10 py-4 lg:py-12">
          <div className="mb-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.23em] text-[#d9c89d]"><span className="h-px w-10 bg-[#d4af37]"/>Православна Церква України</div>
          <h1 className="font-display max-w-3xl text-5xl font-medium leading-[1.02] tracking-[-.025em] sm:text-6xl lg:text-[4.6rem]">Храм святих апостолів <span className="text-[#e3ca84]">Петра і Павла</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#e6e0d2] sm:text-xl">Дім молитви й духовної єдності у серці Кам’янця. Тут кожен може зупинитися, помолитися та знайти розраду у вірі.</p>
          <p className="mt-5 flex items-center gap-2 text-sm text-[#d9d3c7]"><MapPin size={16} className="shrink-0 text-[#d4af37]"/>м. Кам’янець-Подільський, вул. Татарська, 9</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#schedule" className="candle-button inline-flex items-center justify-center gap-2 rounded-sm bg-[#d4af37] px-5 py-3.5 text-sm font-semibold text-[#4a0000] transition">Розклад богослужінь<ArrowRight size={16}/></a>
            <a href="#prayer" className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#d4af37]/55 px-5 py-3.5 text-sm font-medium text-[#f5f0e4] transition hover:border-[#e3ca84] hover:text-[#e3ca84]">Поминання та пожертви<ArrowDown size={15}/></a>
          </div>
        </div>
        <div className="relative mx-auto flex min-h-[390px] w-full max-w-[390px] items-center justify-center py-8 lg:min-h-[470px]">
          <ArchFrame className="absolute inset-0 h-full w-full text-[#d4af37]/75"/>
          <div className="relative mx-9 flex min-h-[310px] w-full flex-col items-center justify-center border-x border-[#d4af37]/25 px-5 text-center sm:min-h-[370px]">
            <CrossMark className="mb-7 h-11 w-9 text-[#e3ca84]"/>
            <span className="text-[10px] font-semibold uppercase tracking-[.25em] text-[#d9c89d]">Молитва · Надія · Любов</span>
            <p className="font-display mt-5 max-w-[260px] text-3xl leading-tight text-[#f5f0e4] sm:text-4xl">«Де двоє чи троє зібрані в Моє ім’я, там Я серед них»</p>
            <span className="mt-5 text-xs tracking-wide text-[#d9c89d]">Мт. 18:20</span>
            <span className="mt-7 h-px w-12 bg-[#d4af37]/80"/>
            <span className="mt-4 text-[10px] uppercase tracking-[.18em] text-[#d9c89d]">Кам’янець-Подільський</span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 h-px w-[min(84%,1100px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#d4af37]/55 to-transparent"/>
    </section>

    <section id="schedule" className="bg-[#f7f4ec] px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center"><CrossMark className="mx-auto h-8 w-6 text-[#a38336]"/><p className="eyebrow mt-4">СПІЛЬНА МОЛИТВА</p><h2 className="font-display mt-3 text-4xl font-medium text-[#142b43] sm:text-5xl">Розклад богослужінь</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600">Приходьте розділити молитву та зустрітися у храмі. У святкові дні розклад може змінюватися.</p></div>
        <div className="mt-9 grid gap-5 md:grid-cols-3">{services.map((service, index) => <article key={service.title} className="service-lectern group relative overflow-hidden border border-[#c6a44b]/40 bg-[#fffdf7] px-6 pb-6 pt-8 text-center transition duration-300 hover:-translate-y-1 hover:border-[#c6a44b] hover:shadow-[0_12px_36px_rgba(212,175,55,.22)] sm:px-7">
          <div className="absolute inset-x-3 top-3 bottom-3 border border-[#c6a44b]/20"/><div className="absolute inset-x-5 top-5 bottom-5 border border-[#c6a44b]/10"/>
          <div className="relative"><span className="mx-auto grid size-9 place-items-center rounded-full border border-[#c6a44b]/50 text-[#9b7b30]"><CalendarDays size={15}/></span><p className="mt-4 text-[10px] font-semibold uppercase tracking-[.2em] text-[#967a3d]">{service.day}</p><h3 className="font-display mt-3 text-2xl leading-tight text-[#142b43]">{service.title}</h3><p className="mt-2 text-xs text-slate-500">{service.note}</p><div className="mx-auto my-5 flex w-fit items-center gap-2 border-y border-[#c6a44b]/35 py-2.5 text-sm font-semibold text-[#183653]"><Clock3 size={15} className="text-[#a38336]"/>{service.time}</div><p className="text-[10px] uppercase tracking-[.17em] text-slate-400">Храм Петра і Павла</p></div>
          <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[#c6a44b]/50 bg-[#f7f4ec]"/><span className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 translate-y-1/2 rotate-45 border border-[#c6a44b]/50 bg-[#f7f4ec]"/>
        </article>)}</div>
        <p className="mt-5 text-center text-xs leading-5 text-slate-400">Час у картках наведений як приклад макета. Уточніть і замініть його на актуальний розклад парафії.</p>
      </div>
    </section>
  </>
}
