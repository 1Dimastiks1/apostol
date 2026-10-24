import React from 'react'
import { ArrowUpRight, Facebook, Heart, MessageCircle } from 'lucide-react'

const profile = 'https://www.facebook.com/protoierej.oleksandr.cisar?locale=uk_UA'

export default function Rector() {
  return <section id="rector" className="bg-white px-6 py-20 sm:py-28"><div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-[#eef6fa] lg:grid-cols-[.8fr_1.2fr]">
    <div className="relative min-h-72 bg-gradient-to-br from-sky-200 via-sky-100 to-amber-50 lg:min-h-[430px]"><div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(#075985 1px, transparent 1px)',backgroundSize:'24px 24px'}}/><div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/80 bg-white/75 p-5 backdrop-blur"><p className="text-xs font-semibold uppercase tracking-[.17em] text-sky-800">НАСТОЯТЕЛЬ ХРАМУ</p><p className="mt-2 text-2xl font-semibold text-slate-900">Отець Олександр Цісар</p><p className="mt-1 text-sm text-slate-600">протоієрей</p></div><div className="absolute right-8 top-8 grid size-14 place-items-center rounded-2xl bg-white/80 text-amber-600 shadow-sm"><Heart size={24}/></div></div>
    <div className="flex flex-col justify-center p-7 sm:p-12 lg:p-16"><p className="eyebrow">ДУХОВНЕ СЛОВО</p><h2 className="section-title mt-4">Про <span className="text-sky-800">настоятеля</span></h2><p className="mt-5 max-w-xl leading-7 text-slate-600">Протоієрей Олександр Цісар — настоятель храму святих апостолів Петра і Павла. На його сторінці можна знайти духовні роздуми, оголошення та інформацію про богослужіння.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><a href={profile} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-800 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-900"><Facebook size={17}/>Сторінка у Facebook<ArrowUpRight size={15}/></a><a href="#contacts" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"><MessageCircle size={17}/>Зв'язатися з храмом</a></div></div>
  </div></section>
}
