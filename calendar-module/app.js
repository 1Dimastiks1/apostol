(() => {
  'use strict';

  const MONTHS_UK = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];
  const WEEKDAYS_UK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
  const SOURCE_URL = 'https://www.pomisna.info/uk/tserkva/kalendar/';
  let officialDailyData = (typeof window !== 'undefined' && window.__CHURCH_CALENDAR_OFFICIAL_DATA__ && typeof window.__CHURCH_CALENDAR_OFFICIAL_DATA__ === 'object')
    ? window.__CHURCH_CALENDAR_OFFICIAL_DATA__
    : {};
  const mountedCalendars = new Set();
  const ownScriptUrl = document.currentScript && document.currentScript.src;
  window.churchCalendarDataReady = Promise.resolve(officialDailyData);

  if (!Object.keys(officialDailyData).length && ownScriptUrl && location.protocol !== 'file:') {
    window.churchCalendarDataReady = fetch(new URL('./calendar-2026.json', ownScriptUrl))
      .then((response) => response.ok ? response.json() : {})
      .then((data) => {
        officialDailyData = data;
        mountedCalendars.forEach((calendar) => calendar.refreshOfficialData());
        return data;
      })
      .catch(() => ({}));
  }

  // Нерухомі дати новоюліанського календаря. «Великі 12» позначені окремо;
  // інші важливі свята також виділяються, але не потрапляють у цей фільтр.
  const FIXED_OBSERVANCES = {
    '1-1': {
      title: 'Обрізання Господнє; святителя Василія Великого',
      saints: 'Святитель Василій Великий, архієпископ Кесарії Каппадокійської',
      major: true,
      description: 'Церква згадує Обрізання Господнє та вшановує святителя Василія Великого — одного з найвидатніших отців Церкви.'
    },
    '1-6': {
      title: 'Богоявлення, Хрещення Господнє',
      saints: 'Хрещення Господа Ісуса Христа в Йордані',
      great12: true,
      description: 'Свято Богоявлення нагадує про Хрещення Ісуса Христа в Йордані та явлення Пресвятої Трійці. У народній традиції день також називають Водохрещем.'
    },
    '1-7': {
      title: 'Собор святого Іоана Предтечі',
      saints: 'Пророк, Предтеча і Хреститель Господній Іоан',
      major: true,
      description: 'Наступного дня після Богоявлення Церква окремо вшановує Іоана Предтечу — того, хто приготував шлях Господній.'
    },
    '1-17': {
      title: 'Преподобний Антоній Великий',
      saints: 'Преподобний Антоній Великий, засновник християнського чернецтва',
      description: 'Пам’ять преподобного Антонія Великого, який присвятив життя молитві та духовному подвигу.'
    },
    '1-25': {
      title: 'Святитель Григорій Богослов',
      saints: 'Святитель Григорій Богослов, архієпископ Константинопольський',
      description: 'Церква вшановує одного з великих учителів християнської віри та богослов’я.'
    },
    '1-30': {
      title: 'Собор трьох святителів',
      saints: 'Василій Великий, Григорій Богослов та Іоан Золотоустий',
      major: true,
      description: 'Спільне вшанування трьох великих святителів, учителів Церкви й проповідників християнської мудрості.'
    },
    '2-2': {
      title: 'Стрітення Господнє',
      saints: 'Зустріч Немовляти Ісуса в Єрусалимському храмі',
      great12: true,
      description: 'Стрітення згадує принесення Немовляти Ісуса до храму та зустріч із праведними Симеоном і Анною.'
    },
    '2-24': {
      title: 'Перше і друге віднайдення глави Іоана Предтечі',
      saints: 'Пророк, Предтеча і Хреститель Господній Іоан',
      description: 'День пам’яті, пов’язаний із віднайденням чесної глави Іоана Предтечі.'
    },
    '3-9': {
      title: 'Святі сорок мучеників Севастійських',
      saints: 'Сорок воїнів-християн, які прийняли мученицьку смерть у Севастії',
      description: 'Церква вшановує мужність сорока мучеників, які залишилися вірними Христу.'
    },
    '3-25': {
      title: 'Благовіщення Пресвятої Богородиці',
      saints: 'Архангел Гавриїл сповіщає Діві Марії благу звістку',
      great12: true,
      description: 'Свято Благовіщення згадує звістку архангела Гавриїла про народження Спасителя та смиренну згоду Пресвятої Богородиці.'
    },
    '4-23': {
      title: 'Великомученик Юрій Переможець',
      saints: 'Святий великомученик Юрій Переможець',
      description: 'Церква вшановує святого Юрія як приклад мужності, вірності Христу та надії.'
    },
    '5-8': {
      title: 'Апостол і євангеліст Іоан Богослов',
      saints: 'Святий апостол і євангеліст Іоан Богослов',
      description: 'Пам’ять апостола Іоана, автора Євангелія та послань, у яких особливо звучить заклик до любові.'
    },
    '5-21': {
      title: 'Рівноапостольні Костянтин та Олена',
      saints: 'Святі рівноапостольні імператор Костянтин і цариця Олена',
      description: 'Церква вшановує святих Костянтина й Олену за служіння поширенню християнської віри.'
    },
    '6-24': {
      title: 'Різдво Іоана Предтечі',
      saints: 'Народження пророка, Предтечі і Хрестителя Господнього Іоана',
      major: true,
      description: 'Свято згадує народження Іоана Предтечі — пророка, покликаного приготувати людей до приходу Христа.'
    },
    '6-29': {
      title: 'Святих апостолів Петра і Павла',
      saints: 'Первоверховні апостоли Петро і Павло',
      major: true,
      description: 'День пам’яті апостолів Петра і Павла, які проповідували Євангеліє та засвідчили свою віру життям.'
    },
    '7-20': {
      title: 'Пророк Ілля',
      saints: 'Святий славний пророк Ілля',
      description: 'Церква вшановує пророка Іллю — ревного свідка віри в єдиного Бога.'
    },
    '8-1': {
      title: 'Винесення чесних древ Животворчого Хреста Господнього',
      saints: 'Вшанування Чесного і Животворчого Хреста Господнього',
      major: true,
      description: 'Початок Успенського посту та день особливого вшанування Хреста Господнього.'
    },
    '8-6': {
      title: 'Преображення Господнє',
      saints: 'Преображення Ісуса Христа перед учнями на горі Фавор',
      great12: true,
      description: 'Свято згадує явлення учням Божественної слави Христа на горі Фавор.'
    },
    '8-15': {
      title: 'Успіння Пресвятої Богородиці',
      saints: 'Успіння Пресвятої Владичиці нашої Богородиці',
      great12: true,
      description: 'Свято Успіння говорить про мирне упокоєння Божої Матері та Її перехід до життя вічного.'
    },
    '8-29': {
      title: 'Усікновення глави Іоана Предтечі',
      saints: 'Мученицька кончина пророка, Предтечі і Хрестителя Господнього Іоана',
      major: true,
      strictFast: true,
      description: 'Скорботний день пам’яті мученицької смерті Іоана Предтечі. За церковною традицією цього дня дотримуються посту.'
    },
    '9-8': {
      title: 'Різдво Пресвятої Богородиці',
      saints: 'Народження Пресвятої Діви Марії',
      great12: true,
      description: 'Перше з дванадесятих свят церковного року згадує народження Діви Марії — початок здійснення Божого задуму спасіння.'
    },
    '9-14': {
      title: 'Воздвиження Чесного і Животворчого Хреста Господнього',
      saints: 'Вшанування Чесного Хреста Господнього',
      great12: true,
      strictFast: true,
      description: 'Свято присвячене віднайденню та воздвиженню Хреста Господнього. Цього дня встановлений піст.'
    },
    '9-17': {
      title: 'Мучениці Віра, Надія, Любов та мати їх Софія',
      saints: 'Святі мучениці Віра, Надія, Любов і Софія',
      description: 'Церква вшановує трьох юних мучениць і їхню матір Софію як свідків непохитної віри.'
    },
    '9-26': {
      title: 'Апостол і євангеліст Іоан Богослов',
      saints: 'Святий апостол і євангеліст Іоан Богослов',
      description: 'Пам’ять апостола Іоана Богослова, учня Христа та проповідника любові Божої.'
    },
    '10-1': {
      title: 'Покрова Пресвятої Богородиці',
      saints: 'Заступництво Пресвятої Богородиці за Церкву та людей',
      major: true,
      description: 'Покрова нагадує про материнське заступництво Богородиці. В Україні цього дня також вшановують захисників і захисниць.'
    },
    '10-14': {
      title: 'Свята Параскева Сербська',
      saints: 'Преподобна Параскева Сербська',
      description: 'Пам’ять преподобної Параскеви, шанованої подвижниці християнського благочестя.'
    },
    '10-26': {
      title: 'Великомученик Димитрій Солунський',
      saints: 'Святий великомученик Димитрій Солунський',
      description: 'Церква вшановує святого Димитрія — воїна і мученика за християнську віру.'
    },
    '10-27': {
      title: 'Преподобний Нестор Літописець',
      saints: 'Преподобний Нестор Києво-Печерський, літописець',
      description: 'Пам’ять преподобного Нестора, ченця Києво-Печерської лаври та літописця Русі.'
    },
    '11-8': {
      title: 'Собор архистратига Михаїла та інших небесних сил безплотних',
      saints: 'Архистратиг Михаїл та всі ангельські сили',
      major: true,
      description: 'Церква вшановує архистратига Михаїла та ангельські сили — служителів Божих і захисників людей.'
    },
    '11-21': {
      title: 'Введення в храм Пресвятої Богородиці',
      saints: 'Введення Діви Марії до Єрусалимського храму',
      great12: true,
      description: 'Свято згадує присвячення юної Марії Богові та її введення до Єрусалимського храму.'
    },
    '11-30': {
      title: 'Апостол Андрій Первозваний',
      saints: 'Святий апостол Андрій Первозваний',
      major: true,
      description: 'Церква вшановує апостола Андрія, одного з перших покликаних Христом учнів.'
    },
    '12-6': {
      title: 'Святитель Миколай, архієпископ Мир Лікійських',
      saints: 'Святий Миколай Чудотворець',
      major: true,
      description: 'День пам’яті святителя Миколая — пастиря, відомого милосердям, допомогою нужденним і заступництвом.'
    },
    '12-9': {
      title: 'Зачаття праведною Анною Пресвятої Богородиці',
      saints: 'Праведні Іоаким та Анна',
      description: 'Церква згадує зачаття Пресвятої Богородиці праведною Анною та благословення її батьків.'
    },
    '12-24': {
      title: 'Навечір’я Різдва Христового',
      saints: 'Переддень свята Різдва Христового',
      major: true,
      strictFast: true,
      description: 'Різдвяний святвечір завершує Різдвяний піст і готує вірян до зустрічі свята Різдва Христового.'
    },
    '12-25': {
      title: 'Різдво Господа Бога і Спасителя нашого Ісуса Христа',
      saints: 'Народження Ісуса Христа у Вифлеємі',
      great12: true,
      description: 'Одне з найбільших християнських свят — народження Ісуса Христа, Спасителя світу.'
    },
    '12-26': {
      title: 'Собор Пресвятої Богородиці',
      saints: 'Пресвята Богородиця та близькі до Різдва Христового святі',
      major: true,
      description: 'Наступного дня після Різдва Христового Церква особливо вшановує Пресвяту Богородицю.'
    },
    '12-31': {
      title: 'Святитель Петро Могила, митрополит Київський',
      saints: 'Святитель Петро Могила, митрополит Київський і всієї Руси',
      major: true,
      description: 'Церква вшановує святителя Петра Могилу — митрополита Київського, церковного діяча й просвітителя.'
    }
  };

  const movableDayNames = {
    cleanMonday: {
      title: 'Початок Великого посту',
      saints: 'Понеділок першого тижня Великого посту',
      description: 'Починається Великий піст — час молитви, покаяння та духовного зосередження.'
    },
    lazarusSaturday: {
      title: 'Лазарева субота',
      saints: 'Воскресіння праведного Лазаря',
      description: 'Субота перед Вербною неділею згадує воскресіння Лазаря та провіщає перемогу Христа над смертю.'
    },
    palmSunday: {
      title: 'Вхід Господній до Єрусалима (Вербна неділя)',
      saints: 'Торжественний вхід Ісуса Христа до Єрусалима',
      description: 'Свято згадує вхід Христа до Єрусалима напередодні Його страждань і воскресіння.',
      great12: true
    },
    easter: {
      title: 'Світле Христове Воскресіння — Пасха',
      saints: 'Воскресіння Господа Ісуса Христа',
      description: 'Найбільше християнське свято — перемога життя над смертю та надія воскресіння для всіх.',
      pascha: true
    },
    ascension: {
      title: 'Вознесіння Господнє',
      saints: 'Вознесіння воскреслого Христа на небеса',
      description: 'На сороковий день після Воскресіння Церква згадує Вознесіння Господа Ісуса Христа.',
      great12: true
    },
    pentecost: {
      title: 'День Святої Трійці — П’ятидесятниця',
      saints: 'Зіслання Святого Духа на апостолів',
      description: 'П’ятидесятниця згадує зіслання Святого Духа на апостолів і народження Церкви Христової.',
      great12: true
    },
    goodFriday: {
      title: 'Велика п’ятниця',
      saints: 'Спомин спасительних страждань і смерті Ісуса Христа',
      description: 'Найскорботніший день Страсного тижня, присвячений спомину розп’яття і смерті Христа.',
      strictFast: true
    },
    holySaturday: {
      title: 'Велика субота',
      saints: 'Перебування тіла Ісуса Христа у гробі та очікування Воскресіння',
      description: 'День тиші й очікування перед святом Пасхи; у храмах звершують особливі богослужіння.',
      strictFast: true
    }
  };

  function localDate(year, monthIndex, day) {
    return new Date(year, monthIndex, day, 12, 0, 0, 0);
  }

  function addDays(date, amount) {
    const result = new Date(date.getTime());
    result.setDate(result.getDate() + amount);
    return result;
  }

  function keyForMonthDay(date) {
    return `${date.getMonth() + 1}-${date.getDate()}`;
  }

  function isoDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function fromIsoDate(value) {
    const [year, month, day] = value.split('-').map(Number);
    return localDate(year, month - 1, day);
  }

  function orthodoxPascha(year) {
    // Православна Пасхалія лишається юліанською; дата переводиться у григоріанський цивільний календар.
    const a = year % 4;
    const b = year % 7;
    const c = year % 19;
    const d = (19 * c + 15) % 30;
    const e = (2 * a + 4 * b - d + 34) % 7;
    const julianMonth = Math.floor((d + e + 114) / 31);
    const julianDay = ((d + e + 114) % 31) + 1;
    const date = new Date(Date.UTC(year, julianMonth - 1, julianDay));
    const julianOffset = Math.floor(year / 100) - Math.floor(year / 400) - 2;
    date.setUTCDate(date.getUTCDate() + julianOffset);
    return localDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  }

  function makeMovableObservances(year, pascha) {
    const result = new Map();
    const add = (date, value) => result.set(isoDate(date), value);
    add(addDays(pascha, -48), movableDayNames.cleanMonday);
    add(addDays(pascha, -8), movableDayNames.lazarusSaturday);
    add(addDays(pascha, -7), movableDayNames.palmSunday);
    add(addDays(pascha, -2), movableDayNames.goodFriday);
    add(addDays(pascha, -1), movableDayNames.holySaturday);
    add(pascha, movableDayNames.easter);
    add(addDays(pascha, 39), movableDayNames.ascension);
    add(addDays(pascha, 49), movableDayNames.pentecost);

    const brightWeek = new Set();
    for (let day = 1; day <= 7; day += 1) brightWeek.add(isoDate(addDays(pascha, day)));
    const pentecostWeek = new Set();
    for (let day = 50; day <= 56; day += 1) pentecostWeek.add(isoDate(addDays(pascha, day)));
    const publicanWeek = new Set();
    for (let day = -69; day <= -63; day += 1) publicanWeek.add(isoDate(addDays(pascha, day)));
    const cheeseWeek = new Set();
    for (let day = -55; day <= -49; day += 1) cheeseWeek.add(isoDate(addDays(pascha, day)));

    const apostlesFastStart = addDays(pascha, 57); // понеділок після Неділі всіх святих
    const apostlesFastEnd = localDate(year, 5, 28); // 28 червня включно

    return { result, brightWeek, pentecostWeek, publicanWeek, cheeseWeek, apostlesFastStart, apostlesFastEnd };
  }

  function compareDateOnly(first, second) {
    return isoDate(first) === isoDate(second);
  }

  function dateIsBetween(date, first, last) {
    const stamp = localDate(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    return stamp >= first.getTime() && stamp <= last.getTime();
  }

  function fastingFor(date, pascha, movable) {
    const iso = isoDate(date);
    const monthDay = keyForMonthDay(date);
    const christmasSeason = (date.getMonth() === 11 && date.getDate() >= 25) || (date.getMonth() === 0 && date.getDate() <= 4);
    if (movable.cheeseWeek.has(iso)) {
      return { isFast: false, label: 'Сирна седмиця · особливий порядок трапези', reason: 'Перед Великим постом діють окремі правила трапези; звірте їх із богослужбовими вказівками.' };
    }
    if (movable.brightWeek.has(iso) || movable.pentecostWeek.has(iso) || movable.publicanWeek.has(iso) || christmasSeason) {
      return { isFast: false, label: 'Суцільний тиждень', reason: 'У цей період звичайні середові та п’ятничні пости скасовуються.' };
    }

    const lentStart = addDays(pascha, -48);
    const lentEnd = addDays(pascha, -1);
    if (dateIsBetween(date, lentStart, lentEnd)) {
      return { isFast: true, label: 'Великий піст', reason: 'День Великого посту. Міра посту залежить від дня тижня та богослужбових вказівок.' };
    }
    if (movable.apostlesFastStart <= movable.apostlesFastEnd && dateIsBetween(date, movable.apostlesFastStart, movable.apostlesFastEnd)) {
      return { isFast: true, label: 'Петрів піст', reason: 'Петрів піст триває від понеділка після Неділі всіх святих до 28 червня.' };
    }
    if (dateIsBetween(date, localDate(date.getFullYear(), 7, 1), localDate(date.getFullYear(), 7, 14))) {
      return { isFast: true, label: 'Успенський піст', reason: 'Успенський піст триває з 1 до 14 серпня включно.' };
    }
    if (dateIsBetween(date, localDate(date.getFullYear(), 10, 15), localDate(date.getFullYear(), 11, 24))) {
      return { isFast: true, label: 'Різдвяний піст', reason: 'Різдвяний піст триває з 15 листопада до 24 грудня включно.' };
    }

    const fixed = FIXED_OBSERVANCES[monthDay];
    if (fixed?.strictFast) return { isFast: true, label: 'Піст за церковною традицією', reason: 'Цього дня церковна традиція передбачає піст.' };
    if (monthDay === '1-5') return { isFast: true, label: 'Навечір’я Богоявлення', reason: 'Навечір’я Богоявлення — день посту.' };

    const weekday = date.getDay();
    if (weekday === 3 || weekday === 5) {
      return { isFast: true, label: weekday === 3 ? 'Середа · пісний день' : 'П’ятниця · пісний день', reason: 'За церковною традицією середа і п’ятниця є пісними днями, крім суцільних тижнів.' };
    }
    return { isFast: false, label: 'Посту немає', reason: 'За загальним календарним правилом цього дня посту немає.' };
  }

  function buildYearData(year) {
    const pascha = orthodoxPascha(year);
    const movable = makeMovableObservances(year, pascha);
    const days = [];
    const totalDays = new Date(year, 1, 29).getMonth() === 1 ? 366 : 365;

    for (let index = 0; index < totalDays; index += 1) {
      const date = localDate(year, 0, 1 + index);
      const fixed = FIXED_OBSERVANCES[keyForMonthDay(date)];
      const moving = movable.result.get(isoDate(date));
      const official = year === 2026 ? officialDailyData[isoDate(date)] : null;
      const observance = moving || fixed || official ? {
        title: moving?.title || fixed?.title || official?.title,
        saints: official?.saints || moving?.saints || fixed?.saints,
        description: moving?.description || fixed?.description || official?.description,
        great12: Boolean(moving?.great12 || fixed?.great12),
        major: Boolean(moving?.major || fixed?.major || official?.major),
        pascha: Boolean(moving?.pascha || fixed?.pascha),
        strictFast: Boolean(moving?.strictFast || fixed?.strictFast)
      } : null;
      const fasting = fastingFor(date, pascha, movable);
      days.push({
        date: isoDate(date),
        year,
        month: date.getMonth(),
        day: date.getDate(),
        weekday: date.getDay(),
        title: observance?.title || 'Пам’ять святих цього дня',
        saints: observance?.saints || 'Святі, пам’ять яких звершується за місячним календарем ПЦУ',
        description: observance?.description || 'Церква щодня вшановує святих і події священної історії. Для повного переліку імен та богослужбових вказівок звіртеся з офіційним календарем ПЦУ.',
        type: observance?.great12 ? 'Велике дванадесяте свято' : (observance?.major || observance?.pascha) ? 'Велике свято' : 'Звичайний день',
        isGreat12: Boolean(observance?.great12),
        isMajor: Boolean(observance?.great12 || observance?.major || observance?.pascha),
        isPascha: Boolean(observance?.pascha),
        isFast: fasting.isFast,
        fastingLabel: fasting.label,
        fastingReason: fasting.reason
      });
    }
    return days;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  }

  function formatFullDate(date) {
    return new Intl.DateTimeFormat('uk-UA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  }

  function capitalize(value) {
    return value.charAt(0).toLocaleUpperCase('uk-UA') + value.slice(1);
  }

  function normalize(value) {
    return value.toLocaleLowerCase('uk-UA').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’‘`']/g, '’').trim();
  }

  function mountChurchCalendar(target, options = {}) {
    const root = typeof target === 'string' ? document.querySelector(target) : target;
    if (!(root instanceof HTMLElement)) return null;

    const today = new Date();
    let viewYear = Number(options.year) || today.getFullYear();
    let viewMonth = today.getMonth();
    let selectedDate = localDate(viewYear, viewMonth, Math.min(today.getDate(), new Date(viewYear, viewMonth + 1, 0).getDate()));
    let activeFilter = 'all';
    let query = '';
    let yearDays = buildYearData(viewYear);
    const originalClass = root.className;
    root.classList.add('cc-calendar-host');

    root.innerHTML = `
      <section class="cc-calendar" aria-label="Церковний календар ПЦУ">
        <header class="cc-header">
          <div class="cc-heading">
            <p class="cc-kicker"><span aria-hidden="true">✦</span> Новоюліанський календар ПЦУ</p>
            <h2 class="cc-title">Церковний календар</h2>
            <p class="cc-intro">Свята, пам’ять святих і загальна позначка посту на кожен день.</p>
          </div>
          <div class="cc-controls" aria-label="Навігація календарем">
            <div class="cc-month-controls">
              <button type="button" class="cc-icon-button" data-action="previous" aria-label="Попередній місяць">‹</button>
              <div class="cc-month-year"><h3 class="cc-month-label" aria-live="polite"></h3><label class="cc-year-label">Рік <input class="cc-year-input" type="number" min="1900" max="2100" inputmode="numeric" aria-label="Вибрати рік"></label></div>
              <button type="button" class="cc-icon-button" data-action="next" aria-label="Наступний місяць">›</button>
            </div>
            <button type="button" class="cc-today-button" data-action="today">Сьогодні</button>
          </div>
        </header>

        <div class="cc-tools">
          <div class="cc-search-wrap">
            <label class="cc-search-label" for="cc-search-${Math.random().toString(36).slice(2, 8)}">Пошук свята або святого</label>
            <div class="cc-search-box"><span aria-hidden="true" class="cc-search-icon">⌕</span><input class="cc-search" type="search" placeholder="Наприклад, Миколай або Благовіщення" autocomplete="off"><button class="cc-clear-search" type="button" aria-label="Очистити пошук" hidden>×</button></div>
            <div class="cc-search-results" role="listbox" hidden></div>
          </div>
          <label class="cc-filter-label">Показати
            <select class="cc-filter" aria-label="Фільтр календаря"><option value="all">Усі дні</option><option value="great">Дванадесяті свята</option><option value="major">Великі свята</option><option value="fast">Пісні дні</option></select>
          </label>
        </div>

        <div class="cc-layout">
          <div class="cc-calendar-panel">
            <div class="cc-weekdays" aria-hidden="true">${WEEKDAYS_UK.map((day) => `<span>${day}</span>`).join('')}</div>
            <div class="cc-days" role="grid" aria-label="Дні місяця"></div>
            <div class="cc-legend" aria-label="Позначення календаря">
              <span><i class="cc-legend-dot cc-legend-great"></i> Велике свято</span>
              <span><i class="cc-legend-dot cc-legend-fast"></i> Пісний день</span>
              <span><i class="cc-legend-dot cc-legend-today"></i> Сьогодні</span>
            </div>
          </div>
          <aside class="cc-detail" aria-live="polite" aria-atomic="true"></aside>
        </div>

        <footer class="cc-footer"><span>Пасхалія та загальні пісні періоди обчислюються для вибраного року.</span><a href="${SOURCE_URL}" target="_blank" rel="noopener noreferrer">Офіційний календар ПЦУ ↗</a></footer>
      </section>`;

    const monthLabel = root.querySelector('.cc-month-label');
    const yearInput = root.querySelector('.cc-year-input');
    const daysGrid = root.querySelector('.cc-days');
    const detail = root.querySelector('.cc-detail');
    const searchInput = root.querySelector('.cc-search');
    const searchResults = root.querySelector('.cc-search-results');
    const clearSearch = root.querySelector('.cc-clear-search');
    const filterSelect = root.querySelector('.cc-filter');
    const searchLabel = root.querySelector('.cc-search-label');
    searchLabel.htmlFor = `cc-search-${Math.random().toString(36).slice(2, 8)}`;
    searchInput.id = searchLabel.htmlFor;

    function dayRecord(date) {
      return yearDays.find((item) => item.date === isoDate(date));
    }

    function renderDetail() {
      const record = dayRecord(selectedDate);
      if (!record) return;
      const dateTitle = capitalize(formatFullDate(selectedDate));
      const holidayClass = record.isPascha ? ' cc-detail--pascha' : record.isGreat12 ? ' cc-detail--great' : '';
      detail.className = `cc-detail${holidayClass}`;
      detail.innerHTML = `
        <p class="cc-detail-kicker">${record.isPascha ? 'Свято свят' : record.isGreat12 ? 'Дванадесяте свято' : record.isMajor ? 'Церковне свято' : 'Пам’ять дня'}</p>
        <p class="cc-detail-date">${escapeHtml(dateTitle)}</p>
        <h3 class="cc-detail-title">${escapeHtml(record.title)}</h3>
        <p class="cc-detail-saints">${escapeHtml(record.saints)}</p>
        <p class="cc-detail-description">${escapeHtml(record.description)}</p>
        <div class="cc-fast-status ${record.isFast ? 'is-fast' : 'is-clear'}"><span class="cc-fast-symbol" aria-hidden="true">${record.isFast ? '◒' : '○'}</span><span><strong>${escapeHtml(record.fastingLabel)}</strong><small>${escapeHtml(record.fastingReason)}</small></span></div>
        <a class="cc-source-link" href="${SOURCE_URL}" target="_blank" rel="noopener noreferrer">Звірити день з календарем ПЦУ ↗</a>`;
    }

    function passesFilter(record) {
      if (activeFilter === 'great') return record.isGreat12;
      if (activeFilter === 'major') return record.isMajor;
      if (activeFilter === 'fast') return record.isFast;
      return true;
    }

    function renderDays() {
      const firstWeekday = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
      const monthLength = new Date(viewYear, viewMonth + 1, 0).getDate();
      const cells = [];
      for (let blank = 0; blank < firstWeekday; blank += 1) cells.push('<span class="cc-day-empty" aria-hidden="true"></span>');

      for (let day = 1; day <= monthLength; day += 1) {
        const date = localDate(viewYear, viewMonth, day);
        const record = dayRecord(date) || {
          date: isoDate(date),
          title: 'Пам’ять святих цього дня',
          saints: '',
          description: '',
          isMajor: false,
          isGreat12: false,
          isPascha: false,
          isFast: false,
          fastingLabel: ''
        };
        const isToday = compareDateOnly(date, today);
        const isSelected = compareDateOnly(date, selectedDate);
        const matchesSearch = !query || normalize(`${record.title} ${record.saints} ${record.description}`).includes(normalize(query));
        const classes = ['cc-day'];
        if (record.isMajor) classes.push('has-major');
        if (record.isGreat12) classes.push('has-great');
        if (record.isPascha) classes.push('is-pascha');
        if (record.isFast) classes.push('has-fast');
        if (isToday) classes.push('is-today');
        if (isSelected) classes.push('is-selected');
        if (!passesFilter(record) || !matchesSearch) classes.push('is-muted');
        const label = `${day} ${MONTHS_UK[viewMonth]}, ${record.title}${record.isFast ? `, ${record.fastingLabel}` : ''}`;
        const marks = `${record.isMajor ? '<i class="cc-mark cc-mark-great" aria-hidden="true">✦</i>' : ''}${record.isFast ? '<i class="cc-mark cc-mark-fast" aria-hidden="true">·</i>' : ''}`;
        cells.push(`<button type="button" class="${classes.join(' ')}" role="gridcell" data-date="${record.date}" aria-label="${escapeHtml(label)}" aria-selected="${isSelected}"${isToday ? ' aria-current="date"' : ''} title="${escapeHtml(label)}"><span class="cc-day-number">${day}</span><span class="cc-day-marks">${marks}</span></button>`);
      }
      daysGrid.innerHTML = cells.join('');
    }

    function renderSearchResults() {
      clearSearch.hidden = !query;
      if (!query) {
        searchResults.hidden = true;
        searchResults.innerHTML = '';
        return;
      }
      const normalizedQuery = normalize(query);
      const matches = yearDays.filter((record) => normalize(`${record.title} ${record.saints} ${record.description}`).includes(normalizedQuery)).slice(0, 8);
      searchResults.hidden = false;
      if (matches.length === 0) {
        searchResults.innerHTML = '<p class="cc-search-empty">Збігів у цьому році не знайдено.</p>';
        return;
      }
      searchResults.innerHTML = matches.map((record) => {
        const date = fromIsoDate(record.date);
        return `<button type="button" class="cc-search-result" role="option" data-date="${record.date}"><span>${escapeHtml(record.title)}</span><small>${escapeHtml(formatFullDate(date))}</small></button>`;
      }).join('');
    }

    function render() {
      monthLabel.textContent = `${MONTHS_UK[viewMonth]} ${viewYear}`;
      yearInput.value = viewYear;
      renderDays();
      renderDetail();
      renderSearchResults();
    }

    function selectDate(value) {
      const date = fromIsoDate(value);
      viewYear = date.getFullYear();
      viewMonth = date.getMonth();
      selectedDate = date;
      yearDays = buildYearData(viewYear);
      query = '';
      searchInput.value = '';
      render();
    }

    function changeMonth(amount) {
      const next = new Date(viewYear, viewMonth + amount, 1, 12);
      viewYear = next.getFullYear();
      viewMonth = next.getMonth();
      selectedDate = localDate(viewYear, viewMonth, 1);
      yearDays = buildYearData(viewYear);
      render();
    }

    root.addEventListener('click', (event) => {
      const actionButton = event.target.closest('[data-action]');
      if (actionButton && root.contains(actionButton)) {
        const action = actionButton.dataset.action;
        if (action === 'previous') changeMonth(-1);
        if (action === 'next') changeMonth(1);
        if (action === 'today') {
          viewYear = today.getFullYear();
          viewMonth = today.getMonth();
          selectedDate = localDate(today.getFullYear(), today.getMonth(), today.getDate());
          yearDays = buildYearData(viewYear);
          query = '';
          searchInput.value = '';
          activeFilter = 'all';
          filterSelect.value = 'all';
          render();
        }
        return;
      }
      const dateButton = event.target.closest('[data-date]');
      if (dateButton && root.contains(dateButton)) selectDate(dateButton.dataset.date);
    });

    searchInput.addEventListener('input', () => {
      query = searchInput.value.trim();
      renderDays();
      renderSearchResults();
    });

    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        query = '';
        searchInput.value = '';
        renderDays();
        renderSearchResults();
      }
      if (event.key === 'Enter') {
        const firstResult = searchResults.querySelector('[data-date]');
        if (firstResult) selectDate(firstResult.dataset.date);
      }
    });

    clearSearch.addEventListener('click', () => {
      query = '';
      searchInput.value = '';
      renderDays();
      renderSearchResults();
      searchInput.focus();
    });

    filterSelect.addEventListener('change', () => {
      activeFilter = filterSelect.value;
      renderDays();
    });

    yearInput.addEventListener('change', () => {
      const nextYear = Math.min(2100, Math.max(1900, Number(yearInput.value) || today.getFullYear()));
      const selectedDay = Math.min(selectedDate.getDate(), new Date(nextYear, viewMonth + 1, 0).getDate());
      viewYear = nextYear;
      selectedDate = localDate(nextYear, viewMonth, selectedDay);
      yearDays = buildYearData(viewYear);
      render();
    });

    render();
    const calendarApi = {
      destroy() {
        mountedCalendars.delete(calendarApi);
        root.innerHTML = '';
        root.className = originalClass;
      },
      goToToday() {
        root.querySelector('[data-action="today"]')?.click();
      },
      setYear(year) {
        const nextYear = Math.min(2100, Math.max(1900, Number(year) || today.getFullYear()));
        viewYear = nextYear;
        selectedDate = localDate(nextYear, viewMonth, Math.min(selectedDate.getDate(), new Date(nextYear, viewMonth + 1, 0).getDate()));
        yearDays = buildYearData(viewYear);
        render();
      },
      refreshOfficialData() {
        if (viewYear === 2026) {
          yearDays = buildYearData(viewYear);
          render();
        }
      }
    };
    mountedCalendars.add(calendarApi);
    return calendarApi;
  }

  window.mountChurchCalendar = mountChurchCalendar;
  window.getChurchCalendarYearData = (year = new Date().getFullYear()) => buildYearData(Math.min(2100, Math.max(1900, Number(year) || new Date().getFullYear())));
})();
