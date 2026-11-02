import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { PARISH_PAGE, PHONE, PHONE_LABEL, REVIEWS_URL } from '@/lib/parish'
import { SectionHeading } from './section-heading'

const CATEGORIES = [
  ['all', 'Усі'],
  ['worship', 'Богослужіння'],
  ['visit', 'Візит до храму'],
  ['memorial', 'Поминання'],
  ['sacraments', 'Таїнства'],
  ['donation', 'Пожертви'],
] as const

type Cat = (typeof CATEGORIES)[number][0]

const link = (href: string, text: string) => <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-4">{text}</a>

const FAQ: { cat: Cat; q: string; a: React.ReactNode; plain: string }[] = [
  { cat: 'worship', q: 'Де перевірити актуальний розклад служб?', plain: 'facebook телефон розклад', a: <>Час богослужінь може змінюватися залежно від церковного календаря та парафіяльних оголошень. Перевірте найновіші дописи на {link(PARISH_PAGE, 'сторінці парафії у Facebook')} або зателефонуйте до храму.</> },
  { cat: 'visit', q: 'Де розташований храм?', plain: 'адреса татарська 9 карта', a: <>М. Кам’янець-Подільський, вул. Татарська, 9. Нижче на сторінці є карта та кнопка, щоб скопіювати адресу.</> },
  { cat: 'worship', q: 'Чи можна прийти на сповідь до початку служби?', plain: 'сповідь', a: <>Порядок і час сповіді можуть залежати від конкретного богослужіння. Звірте оголошення перед візитом або уточніть деталі за телефоном парафії.</> },
  { cat: 'memorial', q: 'Як подати поминання за здоров’я чи упокій?', plain: 'записка диптих імена', a: <>Заповніть бланк у розділі «Поминання»: оберіть потрібний диптих і впишіть хрещені імена. Сайт підготує текст для копіювання та відкриє Facebook; допис потрібно перевірити й надіслати самостійно.</> },
  { cat: 'sacraments', q: 'Як домовитися про хрещення або вінчання?', plain: 'хрещення вінчання документи', a: <>Зателефонуйте до храму за номером <a href={`tel:${PHONE}`} className="font-semibold text-primary underline underline-offset-4">{PHONE_LABEL}</a>, щоб узгодити дату, підготовку та потрібні документи.</> },
  { cat: 'sacraments', q: 'Як залишити відгук про хрещення чи вінчання?', plain: 'відгук', a: <>Перейдіть на {link(REVIEWS_URL, 'сторінку храму з відгуками')}, щоб переглянути або залишити власний.</> },
  { cat: 'donation', q: 'Як підтримати храм?', plain: 'пожертва оплата', a: <>Оберіть напрям і суму в блоці пожертв та перейдіть до оплати. Перед підтвердженням переказу уважно перевірте одержувача, суму й призначення: обрані на сайті дані не передаються автоматично.</> },
  { cat: 'worship', q: 'Де дивитися прямі ефіри богослужінь?', plain: 'ефір трансляція онлайн', a: <>У розділі «Онлайн» на цій сторінці — останній ефір та архів. Час трансляції перевіряйте в останніх дописах Facebook.</> },
]

const MOMENTS = [
  ['Вінчання', 'Урочиста молитва про благословення сім’ї. У тиші храму слова обітниці стають початком спільної духовної дороги, а цей день єднає родину в радості й надії.'],
  ['Хрещення', 'Світла духовна подія для дитини й усієї родини. Молитва батьків, хрещених і громади супроводжує новий шлях у вірі, любові та добрих справах.'],
  ['Літургія', 'Збирає парафію для спільної молитви й подяки. Це час зупинитися серед щоденних турбот, помолитися за близьких і відчути підтримку церковної громади.'],
]

export function Faq() {
  const [cat, setCat] = useState<Cat>('all')
  const [query, setQuery] = useState('')
  const items = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('uk-UA')
    return FAQ.filter((f) => (cat === 'all' || f.cat === cat) && (!q || `${f.q} ${f.plain}`.toLocaleLowerCase('uk-UA').includes(q)))
  }, [cat, query])

  return (
    <section id="faq" className="bg-parchment py-28 sm:py-36">
      <div className="shell grid gap-16 lg:grid-cols-[1.25fr_.75fr] lg:gap-20">
        <div>
          <SectionHeading index="11" eyebrow="Відповіді" title={<>Часті <em className="text-primary">запитання</em></>} />
          <div className="reveal mt-10">
            <label className="relative block">
              <span className="sr-only">Пошук відповіді</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Наприклад: розклад, адреса, хрещення" className="field !pl-11" autoComplete="off" />
            </label>
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Категорії запитань">
              {CATEGORIES.map(([key, label]) => <button key={key} type="button" className="chip" aria-pressed={cat === key} onClick={() => setCat(key)}>{label}</button>)}
            </div>
          </div>
          <div className="mt-8 divide-y divide-border border-y border-border">
            {items.map((f) => (
              <details key={f.q} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-[1.45rem] leading-snug text-ink marker:hidden [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <Plus className="size-5 shrink-0 text-gold-deep transition-transform duration-300 group-open:rotate-45" />
                </summary>
                <div className="pb-6 pr-10 leading-relaxed text-muted-foreground">{f.a}</div>
              </details>
            ))}
          </div>
          {!items.length && <p className="mt-6 text-muted-foreground">За цим запитом відповідей не знайдено. Зателефонуйте до парафії — допоможемо з’ясувати деталі.</p>}
        </div>

        <aside className="lg:pt-6">
          <p className="eyebrow">Важливі миті у храмі</p>
          <div className="mt-8 space-y-5">
            {MOMENTS.map(([title, text]) => (
              <figure key={title} className="reveal rounded-3xl bg-wine-deep p-8 text-ivory">
                <p className="font-display text-5xl leading-none text-gold" aria-hidden="true">“</p>
                <blockquote className="-mt-2 leading-relaxed text-ivory/80"><span className="font-display text-2xl text-gold-light">{title}</span> — {text.charAt(0).toLowerCase() + text.slice(1)}</blockquote>
                <figcaption className="mt-5 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-ivory/45">Петропавлівська парафія</figcaption>
              </figure>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}
