import React from 'react'
import { ArrowUpRight, Facebook, MapPin } from 'lucide-react'

const profile = 'https://www.facebook.com/protoierej.oleksandr.cisar?locale=uk_UA'
const photoPost = 'https://www.facebook.com/permalink.php?story_fbid=1456099246367699&id=100059029128700'

function IconFrame() {
  return <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full text-[#e5b842] drop-shadow-[0_0_5px_rgba(229,184,66,.3)]" viewBox="0 0 380 540" fill="none" preserveAspectRatio="none"><path d="M15 525V180C15 88 90 14 182 14h16c92 0 167 74 167 166v345M29 525V180c0-84 69-152 153-152h16c84 0 153 68 153 152v345" stroke="currentColor" strokeWidth="1.4"/><path d="M190 2v24m-9-15h18m-15 6h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="190" cy="14" r="3" fill="currentColor"/></svg>
}

export default function Rector() {
  return <section id="rector" className="bg-[#3a0000] px-5 py-20 text-[#faf6ee] sm:px-9 sm:py-28 lg:px-16">
    <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-[.82fr_1.18fr] lg:items-start lg:gap-20">
      <div className="relative mx-auto w-full max-w-[420px] pb-8">
        <div className="relative mx-5 aspect-[.704] overflow-hidden bg-[#260000] sm:mx-7">
          <img src={`${import.meta.env.BASE_URL}images/rector-oleksandr-tsisar.png`} alt="Протоієрей Олександр Цісар у святковому облаченні в храмі" className="absolute inset-0 h-full w-full object-cover object-[50%_24%]" style={{ clipPath: 'polygon(4% 100%,4% 33%,4.5% 27%,6% 21%,9% 15%,14% 10%,21% 6%,30% 4%,40% 3%,50% 2.6%,60% 3%,70% 4%,79% 6%,86% 10%,91% 15%,94% 21%,95.5% 27%,96% 33%,96% 100%)' }} loading="lazy"/>
          <IconFrame/>
        </div>
        <div className="relative z-10 mx-5 -mt-px border border-[#e5b842]/55 bg-[#4a0000] px-4 py-4 text-center shadow-[0_12px_28px_rgba(0,0,0,.2)] sm:mx-7 sm:px-6"><p className="font-display text-xl uppercase tracking-[.1em] text-[#e5b842] sm:text-2xl">Протоієрей Олександр Цісар</p><p className="mt-1 text-xs leading-5 text-[#eadfca] sm:text-sm">Настоятель храму святих апостолів Петра і Павла</p></div>
        <div className="relative z-10 mx-5 -mt-1 flex items-center justify-between border border-[#e5b842]/30 bg-[#4a0000] px-4 py-3 sm:mx-7"><span className="inline-flex items-center gap-2 text-xs text-[#eadfca]"><MapPin size={14} className="text-[#e5b842]"/>Кам’янець-Подільський</span><a href={profile} target="_blank" rel="noreferrer" aria-label="Facebook отця Олександра Цісаря" className="text-[#e5b842] transition hover:text-white"><Facebook size={18}/></a></div>
      </div>

      <div className="pt-2">
        <p className="eyebrow !text-[#e5b842]">ПАСТИРСЬКЕ СЛОВО · ПАРАФІЯЛЬНИЙ ЛІТОПИС</p>
        <h2 className="font-display mt-4 text-4xl font-medium uppercase leading-tight tracking-[.035em] text-[#faf6ee] sm:text-5xl lg:text-6xl">Настоятель та історія храму</h2>
        <p className="font-display mt-5 text-2xl uppercase tracking-[.08em] text-[#e5b842] sm:text-3xl">Отець Олександр Цісар</p>
        <blockquote className="mt-7 border-l border-[#e5b842] pl-5 sm:pl-7"><p className="text-lg leading-8 text-[#f3ead7] sm:text-xl">У парафіяльних дописах отець Олександр запрошує громаду до спільної молитви за Україну, наших воїнів, близьких і тих, хто потребує підтримки.</p><cite className="mt-3 block text-xs not-italic text-[#cdbd9c]">За оголошеннями Петропавлівської парафії у Facebook</cite></blockquote>
        <div id="history" className="history-paper relative mt-9 border border-[#e5b842]/65 bg-[#faf6ee] p-6 text-[#221d18] shadow-[0_20px_60px_rgba(0,0,0,.22)] sm:p-8">
          <div className="pointer-events-none absolute inset-2 border border-[#b28f3d]/30"/>
          <div className="relative"><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#795d22]">ПАМ’ЯТКА СТАРОГО МІСТА</p><h3 className="font-display mt-3 text-3xl uppercase tracking-[.06em] text-[#3a0000] sm:text-4xl">Літопис Петропавлівського храму</h3>
            <p className="drop-cap mt-5 text-base leading-8 sm:text-lg">Петропавлівський храм стоїть на вулиці Татарській у Старому місті Кам’янця-Подільського. На офіційній сторінці парафія називає його святинею XIV століття — місцем молитви, яке поєднує історичну пам’ять міста з живим церковним життям.</p>
            <p className="mt-4 text-base leading-8 sm:text-lg">Сьогодні громада збирається тут на Божественну літургію, молиться за Україну, захисників і спочилих. Актуальні оголошення та світлини настоятель і парафія публікують у Facebook.</p>
            <a href={photoPost} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#660000] hover:text-[#9a6d16]">Відкрити допис парафії про храм<ArrowUpRight size={13}/></a>
          </div>
        </div>
        <a href={profile} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#e5b842] transition hover:text-white"><Facebook size={17}/>Сторінка настоятеля<ArrowUpRight size={15}/></a>
      </div>
    </div>
  </section>
}
