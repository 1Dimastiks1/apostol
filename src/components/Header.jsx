import React, { useState } from 'react'
import { Menu, X, Cross } from 'lucide-react'

const links = [['Головна', '#home'], ['Прямі ефіри', '#live'], ['Події', '#news'], ['Про Настоятеля', '#rector'], ['Контакти', '#contacts']]

export default function Header() {
  const [open, setOpen] = useState(false)
  return <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
      <a href="#home" className="flex items-center gap-3" aria-label="На головну">
        <span className="grid size-11 place-items-center rounded-2xl bg-sky-50 text-sky-800 ring-1 ring-sky-100"><Cross size={22} strokeWidth={1.7} /></span>
        <span className="max-w-60 text-sm font-semibold leading-snug text-slate-800 sm:max-w-none sm:text-base">Храм св. апостолів Петра і Павла <span className="font-normal text-slate-500">(ПЦУ)</span></span>
      </a>
      <nav className="hidden items-center gap-7 lg:flex">{links.map(([name, href]) => <a key={href} className="text-sm font-medium text-slate-600 transition hover:text-sky-800" href={href}>{name}</a>)}</nav>
      <button className="grid size-10 place-items-center rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? 'Закрити меню' : 'Відкрити меню'} aria-expanded={open}>{open ? <X size={22} /> : <Menu size={22} />}</button>
    </div>
    {open && <nav className="border-t border-slate-100 bg-white px-5 py-3 lg:hidden">{links.map(([name, href]) => <a key={href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-sky-50" href={href}>{name}</a>)}</nav>}
  </header>
}
