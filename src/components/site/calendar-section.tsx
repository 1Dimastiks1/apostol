import { useEffect } from 'react'

export function CalendarSection() {
  useEffect(() => {
    // Модуль календаря сам монтується в #church-calendar-widget і має власний заголовок
    import('../../calendar-entry.js').catch(() => {})
  }, [])

  return (
    <section id="calendar" className="grain relative isolate overflow-hidden bg-night py-24 text-ivory sm:py-32" aria-label="Новоюліанський церковний календар ПЦУ">
      <div className="pointer-events-none absolute -left-40 top-10 -z-10 size-[620px] rounded-full bg-[radial-gradient(circle,rgba(122,28,34,.45),transparent_65%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-48 bottom-0 -z-10 size-[560px] rounded-full bg-[radial-gradient(circle,rgba(198,160,82,.18),transparent_65%)]" aria-hidden="true" />
      <div className="shell max-w-6xl">
        <p className="eyebrow on-dark reveal mb-10"><span className="font-display text-sm tracking-normal opacity-80">03</span>Свята, пам’ять святих і читання дня</p>
        <div id="church-calendar-widget" className="reveal" />
      </div>
    </section>
  )
}
