import React from 'react'
import { ArrowUpRight, Facebook, Radio, Video } from 'lucide-react'

const rectorFacebook = 'https://www.facebook.com/protoierej.oleksandr.cisar?locale=uk_UA'

export default function LiveStreams() {
  return <section id="live" className="bg-white px-6 py-20 sm:py-28">
    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:gap-20">
      <div><p className="eyebrow">БУДЬМО НА ЗВ’ЯЗКУ</p><h2 className="section-title mt-4">Молитва, що <span className="text-sky-800">об’єднує</span></h2><p className="mt-5 max-w-lg leading-7 text-slate-600">Долучайтеся до спільної молитви, де б ви не були. Прямі ефіри богослужінь проходять на сторінці настоятеля у Facebook.</p>
        <a className="mt-8 inline-flex items-center gap-2 rounded-xl bg-sky-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-900" href={rectorFacebook} target="_blank" rel="noreferrer"><Facebook size={17} />Сторінка настоятеля <ArrowUpRight size={16} /></a>
        <p className="mt-4 text-xs text-slate-500">Розклад трансляцій та сповіщення — на Facebook-сторінці отця Олександра.</p>
      </div>
      <div className="relative overflow-hidden rounded-[2rem] bg-sky-50 p-7 sm:p-10"><div className="absolute -right-12 -top-12 size-52 rounded-full border border-sky-100"/><div className="absolute -right-2 -top-2 size-32 rounded-full border border-sky-100"/><div className="relative flex min-h-64 flex-col justify-between rounded-2xl border border-white bg-white/80 p-7 shadow-sm backdrop-blur"><div className="flex items-center justify-between"><span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600"><Radio size={22}/></span><span className="flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"><span className="size-2 animate-pulse rounded-full bg-rose-500"/>БОГОСЛУЖІННЯ</span></div><div><h3 className="text-xl font-semibold text-slate-900">Прямі ефіри та записи</h3><p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">Дивіться трансляції богослужінь і долучайтеся до молитовної спільноти храму.</p></div><div className="flex items-center gap-2 text-sm font-medium text-sky-800"><Video size={17}/>Facebook настоятеля</div></div></div>
    </div>
  </section>
}
