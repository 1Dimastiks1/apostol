import express from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { createFacebookContentService } from './server/facebook-content.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 4173;
const host = process.env.HOST || '127.0.0.1';

// Налаштування безпеки та пароля адміністратора
// Задайте у файлі .env (ADMIN_PASSWORD=ваш_пароль); без нього при кожному запуску генерується тимчасовий пароль
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || crypto.randomBytes(6).toString('hex');
const SESSION_SECRET = process.env.SESSION_SECRET || 'apostol_secret_key_' + ADMIN_PASSWORD;

// Шляхи до файлів та папок
const EVENTS_FILE = resolve(process.cwd(), 'events.json');
const STREAMS_FILE = resolve(process.cwd(), 'streams.json');
const ADMIN_HTML_FILE = resolve(process.cwd(), 'admin.html');
const DIST_DIR = resolve(process.cwd(), 'dist');
const PUBLIC_DIR = resolve(process.cwd(), 'public');

// Список відкликаних токенів (чорний список після logout)
const revokedTokens = new Set();

// Ініціалізація сервісу синхронізації з Facebook для збереження існуючого функціоналу
const service = createFacebookContentService(process.env);

// ==========================================
// СЕРЕДНІЙ РІВЕНЬ (MIDDLEWARE)
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Налаштування CORS та заголовків безпеки
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ==========================================
// ДОПОМІЖНІ ФУНКЦІЇ АВТОРИЗАЦІЇ (TOKEN HELPERS)
// ==========================================

// Генерація підписаного сесійного токена
function generateToken() {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const payload = `${timestamp}:${randomBytes}`;
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}:${signature}`;
}

// Перевірка дійсності токена (валідація підпису та терміну дії)
function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split(':');
  if (parts.length !== 3) return false;

  const [timestampStr, randomBytes, signature] = parts;
  const payload = `${timestampStr}:${randomBytes}`;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');

  try {
    const isSigValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
    if (!isSigValid) return false;
  } catch {
    return false;
  }

  // Перевірка терміну дії: токен дійсний 7 днів (7 * 24 * 60 * 60 * 1000 мс)
  const timestamp = Number(timestampStr);
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  if (isNaN(timestamp) || Date.now() - timestamp > maxAge) {
    return false;
  }

  // Перевірка, чи не був токен анульований при виході
  if (revokedTokens.has(token)) {
    return false;
  }

  return true;
}

// Middleware перевірки прав адміністратора для захищених маршрутів
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Необхідна авторизація адміністратора (відсутній Bearer токен)'
    });
  }

  const token = authHeader.slice(7).trim();
  if (!verifyToken(token)) {
    return res.status(401).json({
      success: false,
      error: 'Сесія недійсна або термін її дії закінчився. Будь ласка, увійдіть знову.'
    });
  }

  req.adminToken = token;
  next();
}

// ==========================================
// РОБОТА З ФАЙЛОМ ДАНИХ (EVENTS.JSON)
// ==========================================

// Безпечне читання подій із файлу
async function readEventsFromFile() {
  try {
    if (!existsSync(EVENTS_FILE)) {
      const initialEvents = [
        {
          id: `evt_${Date.now()}_1`,
          title: 'Недільна Божественна Літургія',
          date: '2026-11-01T09:00',
          description: 'Запрошуємо на спільну молитву. Прямий ефір дивіться на <a href="https://www.facebook.com/protoierej.oleksandr.cisar?locale=uk_UA" target="_blank" rel="noopener noreferrer">Facebook-сторінці отця Олександра</a>.',
          link: 'https://www.facebook.com/protoierej.oleksandr.cisar?locale=uk_UA',
          createdAt: new Date().toISOString()
        }
      ];
      await writeFile(EVENTS_FILE, JSON.stringify(initialEvents, null, 2), 'utf-8');
      return initialEvents;
    }
    const data = await readFile(EVENTS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Помилка читання events.json:', err);
    return [];
  }
}

// Збереження подій у файл
async function writeEventsToFile(events) {
  await writeFile(EVENTS_FILE, JSON.stringify(events, null, 2), 'utf-8');
}

// ==========================================
// РОБОТА З ФАЙЛОМ ДАНИХ (STREAMS.JSON)
// ==========================================

const STREAMS_INITIAL = [
  {
    id: 'str_sample_1',
    title: 'Дмитрівська поминальна субота — пряма трансляція',
    videoUrl: 'https://www.facebook.com/protoierej.oleksandr.cisar/videos/2240800903146412/',
    description: 'Запис Божественної літургії та панахиди у Петропавлівському храмі, 24 жовтня 2026.',
    dateLabel: '24 жовтня 2026',
    date: '2026-10-24',
    isLive: false,
    isPrimary: true,
    createdAt: '2026-10-24T09:00:00.000Z'
  }
];

// Безпечне читання ефірів із файлу
async function readStreamsFromFile() {
  try {
    if (!existsSync(STREAMS_FILE)) {
      await writeFile(STREAMS_FILE, JSON.stringify(STREAMS_INITIAL, null, 2), 'utf-8');
      return STREAMS_INITIAL;
    }
    const data = await readFile(STREAMS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Помилка читання streams.json:', err);
    return [];
  }
}

// Збереження ефірів у файл
async function writeStreamsToFile(streams) {
  await writeFile(STREAMS_FILE, JSON.stringify(streams, null, 2), 'utf-8');
}

// ==========================================
// МАРШРУТИ АВТОРИЗАЦІЇ (AUTH API)
// ==========================================

// Вхід адміністратора за паролем
const loginHandler = (req, res) => {
  const { password } = req.body || {};
  if (!password) {
    return res.status(400).json({ success: false, error: 'Введіть пароль' });
  }

  if (password === ADMIN_PASSWORD) {
    const token = generateToken();
    return res.json({
      success: true,
      message: 'Авторизація успішна',
      token
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Невірний пароль адміністратора'
  });
};

app.post('/api/admin/login', loginHandler);
app.post('/apostol/api/admin/login', loginHandler);

// Перевірка дійсності поточної сесії
const verifyHandler = (req, res) => {
  res.json({ success: true, message: 'Сесія дійсна' });
};

app.get('/api/admin/verify', requireAuth, verifyHandler);
app.get('/apostol/api/admin/verify', requireAuth, verifyHandler);

// Вихід (анулювання токена)
const logoutHandler = (req, res) => {
  if (req.adminToken) {
    revokedTokens.add(req.adminToken);
  }
  res.json({ success: true, message: 'Успішний вихід із системи' });
};

app.post('/api/admin/logout', requireAuth, logoutHandler);
app.post('/apostol/api/admin/logout', requireAuth, logoutHandler);

// ==========================================
// МАРШРУТИ ДЛЯ ПОДІЙ ТА ЕФІРІВ (EVENTS API)
// ==========================================

// Отримання списку всіх подій (публічний доступ)
const getEventsHandler = async (req, res) => {
  try {
    const events = await readEventsFromFile();
    // Повертаємо події
    res.setHeader('Cache-Control', 'no-store');
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Помилка при читанні подій' });
  }
};

app.get('/api/events', getEventsHandler);
app.get('/apostol/api/events', getEventsHandler);

// Додавання нової події (лише для авторизованого адміністратора)
const createEventHandler = async (req, res) => {
  try {
    const { title, date, description, link } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Заголовок події є обов’язковим' });
    }
    if (!date || !date.trim()) {
      return res.status(400).json({ success: false, error: 'Дата та час події є обов’язковими' });
    }

    const events = await readEventsFromFile();

    const newEvent = {
      id: `evt_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      title: title.trim(),
      date: date.trim(),
      description: (description || '').trim(), // зберігає HTML-розмітку (наприклад, посилання <a>)
      link: (link || '').trim(),
      createdAt: new Date().toISOString()
    };

    // Додаємо нову подію на початок списку
    events.unshift(newEvent);
    await writeEventsToFile(events);

    res.status(201).json({
      success: true,
      message: 'Подію успішно створено',
      event: newEvent
    });
  } catch (error) {
    console.error('Помилка додавання події:', error);
    res.status(500).json({ success: false, error: 'Не вдалося зберегти подію' });
  }
};

app.post('/api/events', requireAuth, createEventHandler);
app.post('/apostol/api/events', requireAuth, createEventHandler);

// Видалення події за її ID (лише для авторизованого адміністратора)
const deleteEventHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Не вказано ID події' });
    }

    const events = await readEventsFromFile();
    const eventIndex = events.findIndex(e => e.id === id);

    if (eventIndex === -1) {
      return res.status(404).json({ success: false, error: 'Подію з таким ID не знайдено' });
    }

    const deletedEvent = events.splice(eventIndex, 1)[0];
    await writeEventsToFile(events);

    res.json({
      success: true,
      message: 'Подію успішно видалено',
      deletedId: id,
      deletedTitle: deletedEvent.title
    });
  } catch (error) {
    console.error('Помилка видалення події:', error);
    res.status(500).json({ success: false, error: 'Не вдалося видалити подію' });
  }
};

app.delete('/api/events/:id', requireAuth, deleteEventHandler);
app.delete('/apostol/api/events/:id', requireAuth, deleteEventHandler);

// Оновлення існуючої події за її ID (лише для авторизованого адміністратора)
const updateEventHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Не вказано ID події' });
    }

    const { title, date, description, link } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Заголовок події є обов\'язковим' });
    }
    if (!date || !date.trim()) {
      return res.status(400).json({ success: false, error: 'Дата та час події є обов\'язковими' });
    }

    const events = await readEventsFromFile();
    const eventIndex = events.findIndex(e => e.id === id);

    if (eventIndex === -1) {
      return res.status(404).json({ success: false, error: 'Подію з таким ID не знайдено' });
    }

    events[eventIndex] = {
      ...events[eventIndex],
      title: title.trim(),
      date: date.trim(),
      description: (description || '').trim(),
      link: (link || '').trim(),
      updatedAt: new Date().toISOString()
    };

    await writeEventsToFile(events);

    res.json({
      success: true,
      message: 'Подію успішно оновлено',
      event: events[eventIndex]
    });
  } catch (error) {
    console.error('Помилка оновлення події:', error);
    res.status(500).json({ success: false, error: 'Не вдалося оновити подію' });
  }
};

app.put('/api/events/:id', requireAuth, updateEventHandler);
app.put('/apostol/api/events/:id', requireAuth, updateEventHandler);

// ==========================================
// МАРШРУТИ ДЛЯ ЕФІРІВ (STREAMS API)
// ==========================================

// Отримання списку всіх ефірів (публічний доступ)
const getStreamsHandler = async (req, res) => {
  try {
    const streams = await readStreamsFromFile();
    res.setHeader('Cache-Control', 'no-store');
    res.json(streams);
  } catch (error) {
    res.status(500).json({ error: 'Помилка при читанні ефірів' });
  }
};

app.get('/api/streams', getStreamsHandler);
app.get('/apostol/api/streams', getStreamsHandler);

// Створення нового ефіру (лише для авторизованого адміністратора)
const createStreamHandler = async (req, res) => {
  try {
    const { title, videoUrl, description, dateLabel, date, isLive, isPrimary } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Назва ефіру є обов\'язковою' });
    }
    if (!videoUrl || !videoUrl.trim()) {
      return res.status(400).json({ success: false, error: 'URL відео є обов\'язковим' });
    }

    let streams = await readStreamsFromFile();

    const shouldBePrimary = isPrimary === true || isPrimary === 'true' || streams.length === 0;

    // Якщо новий ефір стає основним — знімаємо прапор з усіх інших
    if (shouldBePrimary) {
      streams = streams.map(s => ({ ...s, isPrimary: false }));
    }

    const newStream = {
      id: `str_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      title: title.trim(),
      videoUrl: videoUrl.trim(),
      description: (description || '').trim(),
      dateLabel: (dateLabel || '').trim(),
      date: (date || '').trim(),
      isLive: isLive === true || isLive === 'true',
      isPrimary: shouldBePrimary,
      createdAt: new Date().toISOString()
    };

    // Додаємо новий ефір на початок списку
    streams.unshift(newStream);
    await writeStreamsToFile(streams);

    res.status(201).json({
      success: true,
      message: 'Ефір успішно створено',
      stream: newStream
    });
  } catch (error) {
    console.error('Помилка створення ефіру:', error);
    res.status(500).json({ success: false, error: 'Не вдалося зберегти ефір' });
  }
};

app.post('/api/streams', requireAuth, createStreamHandler);
app.post('/apostol/api/streams', requireAuth, createStreamHandler);

// Оновлення ефіру за його ID (лише для авторизованого адміністратора)
const updateStreamHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Не вказано ID ефіру' });
    }

    const { title, videoUrl, description, dateLabel, date, isLive, isPrimary } = req.body || {};

    let streams = await readStreamsFromFile();
    const streamIndex = streams.findIndex(s => s.id === id);

    if (streamIndex === -1) {
      return res.status(404).json({ success: false, error: 'Ефір з таким ID не знайдено' });
    }

    const becomePrimary = isPrimary === true || isPrimary === 'true';

    // Якщо ефір стає основним — знімаємо прапор з усіх інших
    if (becomePrimary) {
      streams = streams.map((s, i) => i === streamIndex ? s : { ...s, isPrimary: false });
    }

    streams[streamIndex] = {
      ...streams[streamIndex],
      ...(title !== undefined && { title: title.trim() }),
      ...(videoUrl !== undefined && { videoUrl: videoUrl.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(dateLabel !== undefined && { dateLabel: dateLabel.trim() }),
      ...(date !== undefined && { date: date.trim() }),
      ...(isLive !== undefined && { isLive: isLive === true || isLive === 'true' }),
      ...(isPrimary !== undefined && { isPrimary: becomePrimary }),
      updatedAt: new Date().toISOString()
    };

    await writeStreamsToFile(streams);

    res.json({
      success: true,
      message: 'Ефір успішно оновлено',
      stream: streams[streamIndex]
    });
  } catch (error) {
    console.error('Помилка оновлення ефіру:', error);
    res.status(500).json({ success: false, error: 'Не вдалося оновити ефір' });
  }
};

app.put('/api/streams/:id', requireAuth, updateStreamHandler);
app.put('/apostol/api/streams/:id', requireAuth, updateStreamHandler);

// Видалення ефіру за його ID (лише для авторизованого адміністратора)
const deleteStreamHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Не вказано ID ефіру' });
    }

    const streams = await readStreamsFromFile();
    const streamIndex = streams.findIndex(s => s.id === id);

    if (streamIndex === -1) {
      return res.status(404).json({ success: false, error: 'Ефір з таким ID не знайдено' });
    }

    const deletedStream = streams.splice(streamIndex, 1)[0];
    await writeStreamsToFile(streams);

    res.json({
      success: true,
      message: 'Ефір успішно видалено',
      deletedId: id,
      deletedTitle: deletedStream.title
    });
  } catch (error) {
    console.error('Помилка видалення ефіру:', error);
    res.status(500).json({ success: false, error: 'Не вдалося видалити ефір' });
  }
};

app.delete('/api/streams/:id', requireAuth, deleteStreamHandler);
app.delete('/apostol/api/streams/:id', requireAuth, deleteStreamHandler);

// ==========================================
// ІНТЕГРАЦІЯ З FACEBOOK API (ЗБЕРЕЖЕННЯ ІСНУЮЧОГО API)
// ==========================================
const facebookApiHandler = async (req, res) => {
  try {
    const payload = await service.getSnapshot();
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.json(payload);
  } catch {
    res.status(503).json({
      configured: service.configured,
      error: 'Facebook-синхронізація тимчасово недоступна.'
    });
  }
};

app.get('/api/facebook-content', facebookApiHandler);
app.get('/apostol/api/facebook-content', facebookApiHandler);

// ==========================================
// ВІДОБРАЖЕННЯ АДМІН-ПАНЕЛІ ТА СТАТИЧНИХ ФАЙЛІВ
// ==========================================

// Маршрут для адмін-панелі
const sendAdminHtml = (req, res) => {
  if (existsSync(ADMIN_HTML_FILE)) {
    return res.sendFile(ADMIN_HTML_FILE);
  }
  const publicAdmin = join(PUBLIC_DIR, 'admin.html');
  if (existsSync(publicAdmin)) {
    return res.sendFile(publicAdmin);
  }
  res.status(404).send('Файл admin.html не знайдено.');
};

app.get(['/admin', '/admin.html', '/apostol/admin', '/apostol/admin.html'], sendAdminHtml);

// Роздача статичних файлів з dist (якщо зібрано проект через npm run build)
if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use('/apostol', express.static(DIST_DIR));
}

// Роздача файлів з public
if (existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR));
  app.use('/apostol', express.static(PUBLIC_DIR));
}

// Роздача кореневих статичних файлів (запасний варіант)
app.use(express.static(process.cwd()));
app.use('/apostol', express.static(process.cwd()));

// Маршрут для головної сторінки сайту
app.get(['/', '/apostol', '/apostol/'], (req, res) => {
  const distIndex = join(DIST_DIR, 'index.html');
  if (existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  const rootIndex = resolve(process.cwd(), 'index.html');
  if (existsSync(rootIndex)) {
    return res.sendFile(rootIndex);
  }
  res.status(404).send('Головна сторінка index.html не знайдена.');
});

// ==========================================
// ЗАПУСК СЕРВЕРА
// ==========================================
service.start();

const server = app.listen(port, host, () => {
  console.log(`\n======================================================`);
  console.log(` Петропавлівський храм — сервер запущено успішно!`);
  console.log(` Головний сайт:   http://${host}:${port}/ (або /apostol/)`);
  console.log(` Адмін-панель:    http://${host}:${port}/admin`);
  console.log(`${process.env.ADMIN_PASSWORD ? ' Пароль адмінки: з ADMIN_PASSWORD у .env' : ` Тимчасовий пароль адмінки: "${ADMIN_PASSWORD}"`}`);
  console.log(` Файл збереження: ${EVENTS_FILE}`);
  console.log(`======================================================\n`);
  console.log(service.configured ? 'Автоматична синхронізація Facebook увімкнена.' : 'Facebook API: токени відсутні у .env (працює у резервному режимі).');
});

server.on('close', () => service.stop());
process.on('SIGINT', () => server.close(() => process.exit(0)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
