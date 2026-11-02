import { photo } from '@/lib/parish'
import { SectionHeading, scrollToId } from './section-heading'

const PRAYERS = [
  {
    tag: 'За перемогу і мир',
    title: 'Молитва за Україну та воїнів',
    body: [
      'Господи Боже сил, Боже спасіння нашого, поглянь у милості й щедротах на смиренних рабів Твоїх і чоловіколюбно вислухай і помилуй нас. Захисти воїнів наших, зміцни їхню силу і мужність, пошли ангелів Своїх на збереження їхніх життів від ворожої зброї.',
      'Подай народові нашому справедливий мир, зціли поранених, визволи полонених і упокій душі загиблих захисників у Царстві Твоїм. Амінь.',
    ],
    note: 'Читається щодня на кожній Літургії та молебні в храмі.',
  },
  {
    tag: 'Святим покровителям',
    title: 'До святих Петра і Павла',
    body: [
      'О святії первоверховні апостоли Петре і Павле, що не відкинули віри і душі свої поклали за Христа! Погляньте милостиво на нас, що до храму вашого прибігаємо і вашого заступництва просимо.',
      'Вблагайте Господа, щоб зміцнив нас у православній вірі, визволив від усяких бід, хвороб і ворожих нападів, і допоміг у чистоті серця творити волю Божу. Амінь.',
    ],
    note: 'Храмове свято парафії — 29 червня.',
  },
]

const INTENTIONS = [
  'За воїнів ЗСУ та захисників неба Кам’янеччини',
  'За одужання недужих та поранених',
  'За дітей, молодь та християнські родини',
  'За спокій душ полеглих героїв України',
]

export function Prayers() {
  return (
    <section id="prayers" className="bg-ivory py-28 sm:py-36">
      <div className="shell">
        <SectionHeading
          index="10"
          eyebrow="Духовна скарбниця"
          title={<>Молитви <em className="text-primary">парафії</em></>}
          lead="Спільні молитви громади за мир в Україні, за воїнів-захисників і до святих первоверховних апостолів."
        />
        <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_1fr_.9fr]">
          {PRAYERS.map((p) => (
            <article key={p.title} className="reveal flex flex-col rounded-3xl border border-border bg-card p-8 sm:p-10">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-gold-deep">{p.tag}</p>
              <h3 className="mt-4 font-display text-[2rem] leading-tight text-ink">{p.title}</h3>
              <div className="mt-6 flex-1 space-y-4 font-display text-[1.25rem] italic leading-relaxed text-ink/80">
                {p.body.map((b) => <p key={b}>«{b}»</p>)}
              </div>
              <p className="mt-8 border-t border-border pt-5 text-sm text-muted-foreground">{p.note}</p>
            </article>
          ))}
          <article className="reveal relative flex min-h-[520px] flex-col justify-end overflow-hidden rounded-3xl text-ivory">
            <img src={photo('parish/analoy-gospel.jpg')} alt="Євангеліє, хрест і образ Богородиці на аналої в храмі" className="absolute inset-0 size-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-night via-night/70 to-night/10" />
            <div className="relative p-8 sm:p-10">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-gold-light">Наміри тижня</p>
              <ul className="mt-5 space-y-3">
                {INTENTIONS.map((i) => <li key={i} className="flex gap-3 leading-snug"><span className="text-gold" aria-hidden="true">✦</span>{i}</li>)}
              </ul>
              <button type="button" onClick={() => scrollToId('calendar')} className="mt-8 text-sm font-bold text-gold-light hover:underline">Щоденні читання в календарі ↑</button>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
