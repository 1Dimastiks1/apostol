import React from 'react'
import { ArrowUpRight, CalendarDays, Facebook, Newspaper } from 'lucide-react'

const pageUrl = 'https://www.facebook.com/profile.php?id=100059029128700&locale=uk_UA'

export default function FacebookFeed() {
  return <section id="news" className="bg-slate-50 px-6 py-20 sm:py-28">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="eyebrow">ЖИТТЯ НАШОЇ ГРОМАДИ</p><h2 className="section-title mt-4">Новини та <span className="text-sky-800">події</span></h2><p className="mt-4 max-w-xl leading-7 text-slate-600">Оголошення, розклад богослужінь і важливі моменти з життя парафії.</p></div><a href={pageUrl} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-sky-800 hover:text-sky-950">Усі новини на Facebook <ArrowUpRight size={16}/></a></div>
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5"><iframe title="Стрічка новин храму у Facebook" src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(pageUrl)}&tabs=timeline&width=700&height=520&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`} width="100%" height="520" style={{border:'none',overflow:'hidden'}} scrolling="no" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" /></div>
        <div className="flex flex-col justify-between gap-5">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-700"><CalendarDays size={20}/></span><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Анонси та розклад</span></div><h3 className="mt-5 text-xl font-semibold text-slate-900">Будьте поруч із життям парафії</h3><p className="mt-3 text-sm leading-6 text-slate-600">На сторінці храму публікуємо актуальні оголошення, зміни у розкладі та запрошуємо до спільних подій.</p><a href={pageUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-800">Перейти до сторінки <ArrowUpRight size={15}/></a></article>
          <a href={pageUrl} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl bg-sky-900 p-6 text-white transition hover:bg-sky-950"><div className="flex items-center gap-4"><span className="grid size-12 place-items-center rounded-xl bg-white/10"><Facebook size={23}/></span><span><span className="block font-semibold">Храм у Facebook</span><span className="mt-1 block text-sm text-sky-100">Відкрити сторінку громади</span></span></div><ArrowUpRight size={20} className="transition group-hover:-translate-y-1 group-hover:translate-x-1"/></a>
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600"><Newspaper size={19} className="mt-0.5 shrink-0 text-sky-800"/>Якщо стрічка Facebook не відображається, перейдіть безпосередньо на сторінку храму.</div>
        </div>
      </div>
    </div>
  </section>
}
