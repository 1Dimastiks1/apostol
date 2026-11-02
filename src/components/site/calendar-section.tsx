import { useEffect } from 'react'

export function CalendarSection() {
  useEffect(() => {
    // Модуль календаря сам монтується в #church-calendar-widget і має власний заголовок
    import('../../calendar-entry.js').catch(() => {})
  }, [])

  return (
    <section id="calendar" className="bg-parchment py-24 sm:py-32" aria-label="Новоюліанський церковний календар ПЦУ">
      <div className="shell max-w-6xl">
        <p className="eyebrow reveal mb-8"><span className="font-display text-sm tracking-normal opacity-80">03</span>Свята, пам’ять святих і читання дня</p>
        <div id="church-calendar-widget" className="reveal" />
      </div>
    </section>
  )
}
