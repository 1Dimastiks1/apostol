import React, { useState } from 'react'
import { Menu, X, Cross } from 'lucide-react'

const links = [['Головна', '#home'], ['Прямі ефіри', '#live'], ['Події та медіа', '#gallery'], ['Настоятель', '#rector'], ['Історія', '#history'], ['Поминання', '#prayer-notes'], ['Контакти', '#contacts']]

export default function Header() {
  const [open, setOpen] = useState(false)
  return <header className="sticky top-0 z-50 border-b border-[#e5b842]/40 bg-[#3a0000]/95 text-[#faf6ee] backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
      <a href="#home" className="flex items-center gap-3" aria-label="На головну">
        <span className="grid size-11 place-items-center rounded-2xl border border-[#e5b842]/50 bg-[#4a0000] text-[#e5b842]"><Cross size={22} strokeWidth={1.7} /></span>
        <span className="max-w-60 text-sm font-semibold leading-snug text-[#faf6ee] sm:max-w-none sm:text-base">Храм св. апостолів Петра і Павла <span className="font-normal text-[#ddc477]">(ПЦУ)</span></span>
      </a>
      <nav className="hidden items-center gap-5 xl:gap-7 lg:flex">{links.map(([name, href]) => <a key={href} className="text-xs font-medium text-[#eadfca] transition hover:text-[#e5b842] xl:text-sm" href={href}>{name}</a>)}</nav>
      <button className="grid size-10 place-items-center rounded-xl text-[#e5b842] hover:bg-white/10 lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? 'Закрити меню' : 'Відкрити меню'} aria-expanded={open}>{open ? <X size={22} /> : <Menu size={22} />}</button>
    </div>
    {open && <nav className="border-t border-[#e5b842]/30 bg-[#3a0000] px-5 py-3 lg:hidden">{links.map(([name, href]) => <a key={href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-medium text-[#eadfca] hover:bg-white/10 hover:text-[#e5b842]" href={href}>{name}</a>)}</nav>}
  </header>
}
