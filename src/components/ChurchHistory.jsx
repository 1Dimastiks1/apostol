import React from 'react'
import { BookOpen } from 'lucide-react'

function HistoryArch() {
  return <svg aria-hidden="true" viewBox="0 0 420 540" fill="none" className="absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] text-[#b28f3d] sm:inset-4 sm:h-[calc(100%-2rem)] sm:w-[calc(100%-2rem)]">
    <path d="M16 524V193C16 96 95 17 192 17h20c97 0 176 79 176 176v331M30 524V193c0-89 73-162 162-162h20c89 0 162 73 162 162v331" stroke="currentColor" strokeWidth="1"/>
    <path d="M210 4v24m-9-15h18m-15 6h12M16 193l14 14m374-14-14 14" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><circle cx="210" cy="17" r="3" fill="currentColor"/>
  </svg>
}

export default function ChurchHistory() {
  return <section id="history" className="bg-[#f4efe3] px-6 py-20 sm:px-10 sm:py-28 lg:px-16">
    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-center lg:gap-16">
      <div className="relative mx-auto min-h-[410px] w-full max-w-[390px] sm:min-h-[500px]">
        <HistoryArch/>
        <div className="relative flex min-h-[410px] flex-col items-center justify-center px-12 text-center sm:min-h-[500px] sm:px-16"><BookOpen size={25} strokeWidth={1.2} className="text-[#8a6c2f]"/><span className="mt-6 text-[10px] uppercase tracking-[.24em] text-[#8a6c2f]">Парафіяльний літопис</span><p className="font-display mt-4 text-3xl leading-tight text-[#4a0000] sm:text-4xl">Пам’ять, що живе у молитві</p><span className="mt-6 h-px w-12 bg-[#b28f3d]"/><span className="mt-4 text-xs text-[#6c6255]">Кам’янець-Подільський</span></div>
      </div>
      <div className="history-book relative border border-[#b28f3d]/55 bg-[#fffaf0] px-6 py-8 shadow-[0_18px_50px_rgba(74,0,0,.08)] sm:px-10 sm:py-12 lg:px-14">
        <div className="pointer-events-none absolute inset-2 border border-[#b28f3d]/20 sm:inset-3"/>
        <div className="relative"><p className="eyebrow">ПАМ’ЯТЬ ПАРАФІЯЛЬНОЇ ГРОМАДИ</p><h2 className="font-display mt-4 text-4xl font-medium leading-tight text-[#4a0000] sm:text-5xl">Історія храму</h2>
          <p className="mt-6 text-lg leading-8 text-[#40372d]">Історія храму святих апостолів Петра і Павла — це передусім історія живої віри, спільної молитви та людей, які з покоління в покоління бережуть духовне життя парафії.</p>
          <p className="mt-5 text-lg leading-8 text-[#40372d]">У церковній тиші кожен знаходить місце для подяки й прохання, для пам’яті про близьких і надії на Господню опіку. Ця спільна молитва єднає громаду та продовжує її шлях у Православній Церкві України.</p>
          <p className="mt-5 text-sm leading-7 text-[#766b5c]">Тут буде доповнена документована історія храму: роки, свідчення та світлини з парафіяльного архіву.</p>
        </div>
      </div>
    </div>
  </section>
}
