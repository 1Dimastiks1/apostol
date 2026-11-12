// Фіксований набір світлячків: однакові позиції при кожному рендері, різні швидкості й ритми мерехтіння
const FIREFLIES = Array.from({ length: 22 }, (_, i) => {
  const r = (n: number) => ((i * 9301 + n * 49297) % 233280) / 233280
  return {
    '--x': `${(r(1) * 96 + 2).toFixed(1)}%`,
    '--y': `${(r(2) * 92 + 4).toFixed(1)}%`,
    '--s': `${(4 + r(3) * 5).toFixed(1)}px`,
    '--d': `${(14 + r(4) * 14).toFixed(1)}s`,
    '--g': `${(3 + r(5) * 4).toFixed(1)}s`,
    '--delay': `${(-r(6) * 20).toFixed(1)}s`,
    '--dx1': `${Math.round((r(7) - 0.5) * 90)}px`, '--dy1': `${Math.round(-r(8) * 70)}px`,
    '--dx2': `${Math.round((r(9) - 0.5) * 110)}px`, '--dy2': `${Math.round(-40 - r(10) * 80)}px`,
    '--dx3': `${Math.round((r(11) - 0.5) * 80)}px`, '--dy3': `${Math.round(-80 - r(12) * 90)}px`,
  } as React.CSSProperties
})

/** Живий фон усього сайту: сітка з крапок, м'які золотисто-бордові «світлові плями» і світлячки */
export function Ambient() {
  return (
    <div className="ambient" aria-hidden="true">
      <span className="ambient-orb ambient-orb--wine" />
      <span className="ambient-orb ambient-orb--gold" />
      <span className="ambient-orb ambient-orb--rose" />
      <span className="ambient-grid" />
      {FIREFLIES.map((style, i) => <span key={i} className="firefly" style={style} />)}
    </div>
  )
}
