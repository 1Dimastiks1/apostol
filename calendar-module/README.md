# Автономний церковний календар ПЦУ

Модуль не має сторонніх залежностей і не змінює стилі решти сторінки. Для вбудовування скопіюйте `styles.css`, `app.js` та `calendar-2026.json` в одну папку проєкту, додайте контейнер і підключіть файли:

```html
<link rel="stylesheet" href="/path/to/styles.css">
<div id="church-calendar"></div>
<script src="/path/to/app.js"></script>
<script>
  mountChurchCalendar('#church-calendar');
</script>
```

Сторінку слід відкривати через вебсервер, а не як `file://`: `app.js` завантажує локальний JSON з тієї самої папки. Початковий вигляд календаря показується одразу, офіційні щоденні записи 2026 року підставляються після завантаження даних.

Можна передати DOM-елемент замість селектора, а також початковий рік:

```js
const calendar = mountChurchCalendar(document.querySelector('#church-calendar'), { year: 2026 });
calendar.goToToday();
calendar.setYear(2027);
calendar.destroy();
```

Для отримання JSON-масиву всіх дат вибраного року доступна функція:

```js
const days = await window.churchCalendarDataReady.then(() => getChurchCalendarYearData(2026));
```

Вона повертає об’єкти з `date`, `title`, `saints`, `description`, `type`, `isGreat12`, `isMajor`, `isFast`, `fastingLabel` і `fastingReason`. Для 2026 року JSON містить записи на всі 365 днів офіційного календаря ПЦУ. Для інших років обчислюються рухомі свята й пости, а для щоденних поминань, яких немає у локальному наборі, модуль показує чесне загальне повідомлення та посилання на офіційний календар замість вигаданих імен.

Офіційний календар ПЦУ: <https://www.pomisna.info/uk/tserkva/kalendar/>.
