import React from 'react'
import { ArrowDown, ArrowRight, MapPin, Play } from 'lucide-react'

export default function Hero() {
  return <section id="home" className="hero relative isolate overflow-hidden bg-slate-950 text-white">
    <div className="absolute inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?auto=format&fit=crop&w=2200&q=85')" }} />
    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-slate-900/20" />
    <div className="mx-auto flex min-h-[620px] max-w-7xl flex-col justify-center px-6 py-24 sm:min-h-[690px] sm:px-10 lg:px-16">
      <div className="mb-7 flex items-center gap-3 text-sm font-medium tracking-wide text-sky-100"><span className="h-px w-9 bg-amber-300" />ПРАВОСЛАВНА ЦЕРКВА УКРАЇНИ</div>
      <h1 className="max-w-3xl text-4xl font-semibold leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl">Храм святих апостолів <span className="text-amber-200">Петра і Павла</span></h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-200 sm:text-xl">Місце молитви, надії та духовної єдності у серці старого Кам'янця.</p>
      <p className="mt-5 flex items-center gap-2 text-sm text-slate-200 sm:text-base"><MapPin size={17} className="text-amber-300" />м. Кам'янець-Подільський, вул. Татарська, 9</p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <a href="#live" className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-950/20 transition hover:bg-amber-200">Дивитися прямі ефіри <Play size={16} fill="currentColor" /></a>
        <a href="#news" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/35 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">Новини та події <ArrowRight size={17} /></a>
      </div>
      <a className="mt-16 flex w-fit items-center gap-2 text-xs uppercase tracking-[.18em] text-white/70 hover:text-white" href="#live">Дізнатися більше <ArrowDown size={14} /></a>
    </div>
    <div className="absolute bottom-0 right-0 hidden h-24 w-[42%] rounded-tl-[3rem] bg-white lg:block" />
  </section>
}
