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
