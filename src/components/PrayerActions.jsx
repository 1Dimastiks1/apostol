import React from 'react'
import { ArrowUpRight, Heart, Plus, Send } from 'lucide-react'

function LineCross() {
  return <svg aria-hidden="true" viewBox="0 0 32 42" fill="none" className="h-7 w-6 text-[#a38336]"><path d="M16 2v38M7 12h18M10 19h12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/></svg>
}

export default function PrayerActions() {
  return <section id="prayer" className="bg-[#3a0000] px-6 py-16 text-[#faf6ee] sm:px-10 sm:py-20 lg:px-16">
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
        <div><p className="eyebrow !text-[#e5b842]">ДОБРА СПРАВА — ТИХА МОЛИТВА</p><h2 className="font-display mt-3 text-4xl font-medium leading-tight text-[#faf6ee] sm:text-5xl">Підтримайте життя парафії</h2></div>
        <p className="max-w-xl text-base leading-7 text-[#eadfca]">Можна звернутися до настоятеля, щоб подати поминання за здоров’я чи упокій близьких або дізнатися, як підтримати храм пожертвою.</p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="relative overflow-hidden border border-[#e5b842]/60 bg-[#faf6ee] p-6 text-[#221d18] sm:p-8"><div className="absolute -right-4 -top-5 opacity-[.12]"><LineCross/></div><div className="relative flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-full border border-[#c6a44b]/50 text-[#967a3d]"><Heart size={18}/></span><div><h3 className="font-display text-2xl text-[#3a0000]">Подати поминання</h3><p className="mt-2 max-w-md text-base leading-7 text-slate-600">Передайте імена для молитви за здоров’я або за упокій — настоятель підкаже, як це зробити.</p><a href="#prayer-notes" className="candle-glow mt-5 inline-flex items-center gap-2 border border-[#660000]/35 px-4 py-2.5 text-sm font-medium text-[#660000] transition">Заповнити записку<Send size={14}/></a></div></div></article>
        <article className="relative overflow-hidden border border-[#e5b842]/60 bg-[#faf6ee] p-6 text-[#221d18] sm:p-8"><div className="absolute -right-4 -top-5 opacity-[.12]"><LineCross/></div><div className="relative flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-full border border-[#c6a44b]/50 text-[#967a3d]"><Plus size={18}/></span><div><h3 className="font-display text-2xl text-[#3a0000]">Скласти пожертву</h3><p className="mt-2 max-w-md text-base leading-7 text-slate-600">Ваша добровільна підтримка допомагає дбати про храм і продовжувати спільну працю парафії.</p><a href="#home" className="candle-glow mt-5 inline-flex items-center gap-2 border border-[#660000]/35 px-4 py-2.5 text-sm font-medium text-[#660000] transition">Обрати суму пожертви<ArrowUpRight size={14}/></a></div></div></article>
      </div>
    </div>
  </section>
}
