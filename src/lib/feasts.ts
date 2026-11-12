/** Дванадесяті свята: за церковним роком, від початку вересня (новоюліанський календар ПЦУ) */
export type Feast = {
  id: string
  title: string
  /** Коротка назва для картки-аверсу */
  short: string
  /** Дата або правило для рухомих свят */
  date: string
  /** Тип: Богородичне чи Господнє */
  kind: 'Богородичне' | 'Господнє'
  icon: string
  /** Кому належить фото ікони, ліцензія та сторінка джерела на Wikimedia Commons */
  credit: { work: string; license: string; url: string }
  text: string
}

const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`

export const FEASTS: Feast[] = [
  {
    id: 'nativity-of-mary', title: 'Різдво Пресвятої Богородиці', short: 'Різдво Богородиці', date: '8 вересня', kind: 'Богородичне',
    icon: 'feasts/nativity-of-mary.jpg',
    credit: { work: 'Ілля Москос, «Різдво Богородиці» (XVII ст.)', license: 'Суспільне надбання', url: commons('Elias Moskos Birth of the Virgin.png') },
    text: 'Церква згадує народження Марії, майбутньої Матері Божої, від праведних Йоакима й Анни. Цим святом починається церковний рік.',
  },
  {
    id: 'exaltation', title: 'Воздвиження Чесного Хреста Господнього', short: 'Воздвиження Хреста', date: '14 вересня', kind: 'Господнє',
    icon: 'feasts/exaltation.jpg',
    credit: { work: 'Ікона «Воздвиження Хреста» (XVIII ст.)', license: 'Суспільне надбання', url: commons('Абраз «Узвышэнне Св. Крыжа». Сярэдзіна ХVIII ст., з Іванаўскага р-на, НММ РБ.jpg') },
    text: 'Свято пам’яті віднайдення Животворчого Хреста та його урочистого піднесення в Єрусалимі. День суворого посту й поклоніння Хресту.',
  },
  {
    id: 'presentation-of-mary', title: 'Введення в храм Пресвятої Богородиці', short: 'Введення в храм', date: '21 листопада', kind: 'Богородичне',
    icon: 'feasts/presentation-of-mary.jpg',
    credit: { work: 'Ікона «Введення в храм» (XIV ст., Охрид)', license: 'Суспільне надбання', url: commons('Presentation of Mary, II Half of XIV Century, St Mary Perivleptos Church, Ohrid Icon Gallery.jpg') },
    text: 'Трирічну Марію батьки привели до Єрусалимського храму, присвятивши її Богові. Свято говорить про посвяту життя молитві.',
  },
  {
    id: 'nativity', title: 'Різдво Христове', short: 'Різдво Христове', date: '25 грудня', kind: 'Господнє',
    icon: 'feasts/nativity.jpg',
    credit: { work: 'Ікона «Різдво Христове» з Гостинополя (бл. 1475)', license: 'Суспільне надбання', url: commons('Nativity from Gostinopolye (c. 1475, Banco Intesa).jpg') },
    text: 'Радісне свято народження Спасителя у Віфлеємі. Вночі перед ним звершується урочиста Літургія, а колядки вславляють Новонародженого.',
  },
  {
    id: 'theophany', title: 'Хрещення Господнє (Богоявлення)', short: 'Богоявлення', date: '6 січня', kind: 'Господнє',
    icon: 'feasts/theophany.jpg',
    credit: { work: 'Ікона «Хрещення Господнє» (поч. XIV ст., Охрид)', license: 'Суспільне надбання', url: commons('Baptism of Christ, Early XIV Century, St Mary Perivleptos Church, Ohrid Icon Gallery.jpg') },
    text: 'Христос приймає хрещення від Івана в Йордані, і відкривається таємниця Пресвятої Трійці. У цей день святять воду.',
  },
  {
    id: 'candlemas', title: 'Стрітення Господнє', short: 'Стрітення', date: '2 лютого', kind: 'Господнє',
    icon: 'feasts/candlemas.jpg',
    credit: { work: 'Ікона «Стрітення» (1420-ті, школа Рубльова)', license: 'Суспільне надбання', url: commons('Candlemas (1420s, Sergiev Posad).jpg') },
    text: 'Праведний Симеон зустрічає в храмі Немовля Христа. Слово «стрітення» означає «зустріч» людини з Богом.',
  },
  {
    id: 'annunciation', title: 'Благовіщення Пресвятої Богородиці', short: 'Благовіщення', date: '25 березня', kind: 'Богородичне',
    icon: 'feasts/annunciation.jpg',
    credit: { work: 'Ікона «Благовіщення» (поч. XIV ст., Охрид)', license: 'Суспільне надбання', url: commons('Annunciation, Early XIV Century, St Mary Perivleptos Church, Ohrid Icon Gallery.jpg') },
    text: 'Архангел Гавриїл звіщає Марії, що вона стане Матір’ю Спасителя. Початок нашого спасіння.',
  },
  {
    id: 'entry', title: 'Вхід Господній до Єрусалима', short: 'Вхід до Єрусалима', date: 'Неділя перед Великоднем', kind: 'Господнє',
    icon: 'feasts/entry.jpg',
    credit: { work: 'Ікона з іконостасу Рутковичів, Скварява Нова — фото Mykola Swarnyk', license: 'CC BY-SA 3.0', url: commons('Rutkovych Skvariava Nova Iconostasis Entry into Jerusalem LNM.jpg') },
    text: 'Вербна неділя: Христос урочисто в’їжджає до Єрусалима, а народ зустрічає Його пальмовим гіллям. У нас освячують вербу.',
  },
  {
    id: 'ascension', title: 'Вознесіння Господнє', short: 'Вознесіння', date: 'На 40-й день після Великодня', kind: 'Господнє',
    icon: 'feasts/ascension.jpg',
    credit: { work: 'Ікона «Вознесіння» (XV ст., Кандія)', license: 'Суспільне надбання', url: commons('Ascension (Candia, 15th c.).jpg') },
    text: 'Воскреслий Господь піднісся на небо в присутності учнів і Богородиці та обіцяв послати їм Утішителя.',
  },
  {
    id: 'pentecost', title: 'Зішестя Святого Духа (П’ятдесятниця)', short: 'П’ятдесятниця', date: 'На 50-й день після Великодня', kind: 'Господнє',
    icon: 'feasts/pentecost.jpg',
    credit: { work: 'Ікона «Зішестя Святого Духа» (1420-ті, школа Рубльова)', license: 'Суспільне надбання', url: commons('Pentecost (1420s, Sergiev Posad).jpg') },
    text: 'День народження Церкви: Дух Святий сходить на апостолів у вигляді вогненних язиків. Храм прикрашають зеленню.',
  },
  {
    id: 'transfiguration', title: 'Преображення Господнє', short: 'Преображення', date: '6 серпня', kind: 'Господнє',
    icon: 'feasts/transfiguration.jpg',
    credit: { work: 'Ікона з іконостасу Рутковичів, Скварява Нова — фото Mykola Swarnyk', license: 'CC BY-SA 3.0', url: commons('Rutkovych Skvariava Nova Iconostasis Transfiguration LNM.jpg') },
    text: 'На горі Фавор Христос являє трьом учням славу Свого Божества. У цей день освячують плоди нового врожаю.',
  },
  {
    id: 'dormition', title: 'Успіння Пресвятої Богородиці', short: 'Успіння', date: '15 серпня', kind: 'Богородичне',
    icon: 'feasts/dormition.jpg',
    credit: { work: 'Ікона «Успіння» (поч. XIV ст., Охрид)', license: 'Суспільне надбання', url: commons('Dormition, Early XIV Century, St Nicholas Gerakomia Church, Ohrid Icon Gallery.jpg') },
    text: 'Свято упокоєння Матері Божої, яку Христос приймає до Себе. Церковний рік завершується цим святом.',
  },
]

/* ── Найближча дата свята (новоюліанський календар ПЦУ, рухомі свята від православної Пасхи) ── */
const FIXED: Record<string, [number, number]> = {
  'nativity-of-mary': [9, 8], exaltation: [9, 14], 'presentation-of-mary': [11, 21], nativity: [12, 25],
  theophany: [1, 6], candlemas: [2, 2], annunciation: [3, 25], transfiguration: [8, 6], dormition: [8, 15],
}
const FROM_PASCHA: Record<string, number> = { entry: -7, ascension: 39, pentecost: 49 }

/** Православна Пасха (юліанська пасхалія) у григоріанському календарі */
export function orthodoxPascha(year: number) {
  const a = year % 4, b = year % 7, c = year % 19
  const d = (19 * c + 15) % 30, e = (2 * a + 4 * b - d + 34) % 7
  const month = Math.floor((d + e + 114) / 31), day = ((d + e + 114) % 31) + 1
  const date = new Date(year, month - 1, day, 12)
  date.setDate(date.getDate() + Math.floor(year / 100) - Math.floor(year / 400) - 2)
  return date
}

const dateIn = (id: string, year: number) => {
  if (FIXED[id]) return new Date(year, FIXED[id][0] - 1, FIXED[id][1], 12)
  const p = orthodoxPascha(year)
  p.setDate(p.getDate() + (FROM_PASCHA[id] ?? 0))
  return p
}

/** Сьогоднішня або найближча майбутня дата свята */
export function nextFeastDate(id: string, from = new Date()) {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 12)
  const date = dateIn(id, today.getFullYear())
  return date < today ? dateIn(id, today.getFullYear() + 1) : date
}

export const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const TEMPLE = { name: 'Храм святих апостолів Петра і Павла ПЦУ', address: 'вул. Татарська, 9, Кам’янець-Подільський' }

/** Посилання «Додати в Google Календар» на весь день свята */
export function googleCalendarUrl(title: string, date: Date, details: string) {
  const next = new Date(date); next.setDate(next.getDate() + 1)
  const url = new URL('https://calendar.google.com/calendar/render')
  url.searchParams.set('action', 'TEMPLATE')
  url.searchParams.set('text', `${title} · Петропавлівський храм`)
  url.searchParams.set('dates', `${isoDay(date).replace(/-/g, '')}/${isoDay(next).replace(/-/g, '')}`)
  url.searchParams.set('details', `${details}\n\n${TEMPLE.name}\n${TEMPLE.address}`)
  url.searchParams.set('location', TEMPLE.address)
  return url.href
}

/** Файл .ics для календаря на iPhone, Android чи комп’ютері */
export function downloadIcs(title: string, date: Date, details: string) {
  const esc = (v: string) => v.replace(/\\/g, '\\\\').replace(/[,;]/g, (m) => `\\${m}`).replace(/\n/g, '\\n')
  const next = new Date(date); next.setDate(next.getDate() + 1)
  const day = isoDay(date).replace(/-/g, '')
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Petropavlivsky Khram//Feasts//UK', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:feast-${day}@petropavlivsky-khram`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART;VALUE=DATE:${day}`, `DTEND;VALUE=DATE:${isoDay(next).replace(/-/g, '')}`,
    `SUMMARY:${esc(`${title} · Петропавлівський храм`)}`,
    `DESCRIPTION:${esc(`${details}\n\n${TEMPLE.name}\n${TEMPLE.address}`)}`,
    `LOCATION:${esc(TEMPLE.address)}`,
    'BEGIN:VALARM', 'TRIGGER:-PT15H', 'ACTION:DISPLAY', `DESCRIPTION:${esc(`Завтра: ${title}`)}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  a.download = `svyato-${day}.ics`
  document.body.appendChild(a); a.click(); a.remove()
  window.setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

declare global { interface Window { churchCalendarGoTo?: (iso: string) => void; __churchCalendarPendingDate?: string } }

/** Показати дату в церковному календарі на сайті (якщо календар ще не завантажився, він відкриє її сам) */
export function showInSiteCalendar(date: Date) {
  const iso = isoDay(date)
  if (window.churchCalendarGoTo) window.churchCalendarGoTo(iso)
  else window.__churchCalendarPendingDate = iso
  document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
