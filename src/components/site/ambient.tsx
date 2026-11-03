/** Живий фон усього сайту: сітка з крапок і м'які золотисто-бордові «світлові плями», що дрейфують і зсуваються разом із прокруткою */
export function Ambient() {
  return (
    <div className="ambient" aria-hidden="true">
      <span className="ambient-orb ambient-orb--wine" />
      <span className="ambient-orb ambient-orb--gold" />
      <span className="ambient-orb ambient-orb--rose" />
      <span className="ambient-grid" />
    </div>
  )
}
