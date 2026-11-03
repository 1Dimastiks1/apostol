import crypto from 'node:crypto';
import { notifyParish, verifyTurnstile } from './protect.mjs';
import seedEvents from '../events.json' with { type: 'json' };
import seedStreams from '../streams.json' with { type: 'json' };
import { createFacebookContentService } from './facebook-content.mjs';

const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex' }
});

const fail = (status, error) => json({ success: false, error }, status);

// Дві ролі: «admin» (ефіри, події й заявки) та «forms» (лише перегляд заявок)
const ROLE_PASSWORDS = () => ({
  admin: process.env.ADMIN_PASSWORD || '',
  forms: process.env.FORMS_PASSWORD || ''
});
const anyPasswordSet = () => Object.values(ROLE_PASSWORDS()).some(Boolean);
const sessionSecret = () => process.env.SESSION_SECRET || `apostol_secret_key_${ROLE_PASSWORDS().admin}_${ROLE_PASSWORDS().forms}`;
const sign = (payload) => crypto.createHmac('sha256', sessionSecret()).update(payload).digest('hex');

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function roleForPassword(password) {
  for (const [role, secret] of Object.entries(ROLE_PASSWORDS())) {
    if (secret && safeEqual(password, secret)) return role;
  }
  return null;
}

function generateToken(role) {
  const payload = `${Date.now()}:${crypto.randomBytes(16).toString('hex')}:${role}`;
  return `${payload}:${sign(payload)}`;
}

/** Повертає роль із дійсного токена або null */
function verifyToken(token) {
  const parts = String(token || '').split(':');
  if (parts.length !== 4 || !anyPasswordSet()) return null;
  const [timestamp, random, role, signature] = parts;
  if (!(role in ROLE_PASSWORDS()) || !ROLE_PASSWORDS()[role]) return null;
  if (!safeEqual(signature, sign(`${timestamp}:${random}:${role}`))) return null;
  const issuedAt = Number(timestamp);
  return Number.isFinite(issuedAt) && Date.now() - issuedAt <= TOKEN_MAX_AGE_MS ? role : null;
}

function roleOf(req) {
  const header = req.headers.get('authorization') || '';
  return header.startsWith('Bearer ') ? verifyToken(header.slice(7).trim()) : null;
}

const isAuthorized = (req) => roleOf(req) === 'admin';
const canReadRequests = (req) => ['admin', 'forms'].includes(roleOf(req));

const SESSION_ERROR = 'Сесія недійсна або термін її дії закінчився. Будь ласка, увійдіть знову.';
const FORBIDDEN_ERROR = 'Цей розділ доступний лише головному адміністратору.';
const denied = (req) => (roleOf(req) ? fail(403, FORBIDDEN_ERROR) : fail(401, SESSION_ERROR));

// Простий захист від перебору паролів і спаму (у межах одного процесу сервера)
const buckets = new Map();
function rateLimited(key, limit, windowMs) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) buckets.clear();
  return hits.length > limit;
}
const clientIp = (req) => (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local').split(',')[0].trim();
// У dev-режимі (без проксі) адреси відвідувачів не розрізнити, тому там ліміт вимкнено.
// На хостингу без адреси клієнта діє спільний ліміт — так захист не обійти, прибравши заголовок.
const HOSTED = () => Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.NODE_ENV === 'production');
const limited = (req, name, limit, windowMs) => {
  const ip = clientIp(req);
  if (ip === 'local' && !HOSTED()) return false;
  return rateLimited(`${name}:${ip}`, limit, windowMs);
};

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const flag = (value) => value === true || value === 'true';
const newId = (prefix) => `${prefix}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

export const REQUEST_TYPES = ['baptism', 'wedding'];
const REQUEST_STATUSES = ['new', 'done'];
const MAX_REQUESTS = 2000;
const MAX_NOTES = 5000;
const NOTE_KINDS = ['health', 'repose'];

/** Український номер: 0XXXXXXXXX або +380XXXXXXXXX (пробіли, дужки й дефіси дозволені) */
export function normalizePhone(value) {
  const digits = String(value || '').replace(/[\s()\-.]/g, '');
  if (/^\+?380\d{9}$/.test(digits)) return `+${digits.replace(/^\+/, '')}`;
  if (/^0\d{9}$/.test(digits)) return `+38${digits}`;
  return null;
}

export function validateRequest(body) {
  const errors = {};
  const type = text(body.type);
  const name = text(body.name).replace(/\s+/g, ' ');
  const phone = normalizePhone(body.phone);
  const date = text(body.date);
  const intention = text(body.intention);

  if (!REQUEST_TYPES.includes(type)) errors.type = 'Оберіть потребу';
  if (name.length < 2) errors.name = 'Вкажіть ім’я (щонайменше 2 літери)';
  else if (name.length > 80 || !/^[\p{L}][\p{L}\s'’ʼ.-]*$/u.test(name)) errors.name = 'Ім’я може містити лише літери, пробіл, апостроф чи дефіс';
  if (!phone) errors.phone = 'Вкажіть номер у форматі 0XX XXX XX XX або +380 XX XXX XX XX';
  if (date) {
    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T23:59:59`) : null;
    if (!parsed || Number.isNaN(parsed.getTime())) errors.date = 'Невірна дата';
    else if (parsed.getTime() < Date.now() - 86_400_000) errors.date = 'Дата не може бути в минулому';
  }
  if (intention.length > 1000) errors.intention = 'Коментар задовгий (до 1000 символів)';
  if (body.consent !== true) errors.consent = 'Підтвердьте, що дані правильні та з вами можна зв’язатися';

  if (Object.keys(errors).length) return { errors, value: null };
  return { errors: null, value: { type, name, phone, date, intention } };
}

/** Записка про поминання: тип і список хрещених імен */
export function validateNote(body) {
  const kind = text(body.kind);
  const names = Array.isArray(body.names) ? body.names.map((n) => text(n).replace(/\s+/g, ' ')) : [];
  const errors = {};
  if (!NOTE_KINDS.includes(kind)) errors.kind = 'Оберіть тип записки';
  const list = names.filter(Boolean);
  if (!list.length) errors.names = 'Додайте принаймні одне ім’я';
  else if (list.length > 30) errors.names = 'Забагато імен в одній записці (до 30)';
  else if (list.some((n) => n.length > 80 || !/^[\p{L}][\p{L}\s'’ʼ.-]*$/u.test(n))) errors.names = 'Імена можуть містити лише літери, пробіл, апостроф чи дефіс';
  if (body.consent !== true) errors.consent = 'Підтвердьте передачу імен парафії';
  if (Object.keys(errors).length) return { errors, value: null };
  return { errors: null, value: { kind, names: list } };
}

const FB_HOSTS = new Set(['facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.watch']);
const MONTHS = { січня: 1, лютого: 2, березня: 3, квітня: 4, травня: 5, червня: 6, липня: 7, серпня: 8, вересня: 9, жовтня: 10, листопада: 11, грудня: 12 };
const decodeEntities = (v) => v.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#039;|&apos;/g, "'");

/** Facebook-посилання «Поділитися» не вбудовується на сайт: розкриваємо його до адреси відео та підтягуємо назву, опис і дату */
export async function resolveFacebookVideo(rawUrl) {
  let url;
  try { url = new URL(String(rawUrl || '').trim()); } catch { return null; }
  if (url.protocol !== 'https:' || !FB_HOSTS.has(url.hostname)) return null;
  const res = await fetch(url, { headers: { 'User-Agent': 'facebookexternalhit/1.1', 'Accept-Language': 'uk-UA,uk;q=0.9' }, redirect: 'follow', signal: AbortSignal.timeout(8000) });
  if (!FB_HOSTS.has(new URL(res.url).hostname)) return null;
  const html = (await res.text()).slice(0, 400_000);
  const meta = (name) => {
    const m = html.match(new RegExp(`<meta[^>]+property="${name}"[^>]+content="([^"]*)"`, 'i'));
    return m ? decodeEntities(m[1]) : '';
  };
  let videoUrl = '';
  const og = (() => { try { return decodeURIComponent(meta('og:url')); } catch { return meta('og:url'); } })();
  const vm = og.match(/^(https:\/\/www\.facebook\.com\/[^/]+)\/videos\/(?:[^/]+\/)?(\d+)/);
  if (vm) videoUrl = `${vm[1]}/videos/${vm[2]}/`;
  const description = meta('og:description');
  if (!videoUrl) {
    // Допис (а не відео): повертаємо чисте посилання, заголовок, початок тексту й дату, якщо вона є в тексті
    const pm = og.match(/^https:\/\/www\.facebook\.com\/([^/]+)\/posts\/(?:[^/]+\/)?(\d+)/);
    if (!pm) return null;
    const rows = description.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    let head = (rows[0] || '').replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '').replace(/[.…\s]+$/u, '').trim();
    const letters = head.replace(/[^\p{L}]/gu, '');
    if (letters.length > 3 && letters === letters.toUpperCase()) head = head.charAt(0) + head.slice(1).toLowerCase();
    const day = description.match(/(\d{1,2})\s+(січня|лютого|березня|квітня|травня|червня|липня|серпня|вересня|жовтня|листопада|грудня)/iu);
    const now = new Date();
    return {
      kind: 'post',
      link: `https://www.facebook.com/${pm[1]}/posts/${pm[2]}`,
      title: head,
      description: rows.slice(1).join('\n').replace(/\u2026$/u, '…'),
      date: day ? new Date(Date.UTC(now.getUTCFullYear(), MONTHS[day[2].toLowerCase()] - 1, Number(day[1]), 7, 0)).toISOString() : '',
    };
  }
  const lines = description.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  let title = lines[0] || '';
  let date = '';
  const dm = title.match(/(\d{1,2})\s+([а-яіїєґ]+)\s+(\d{4})/iu);
  if (dm && MONTHS[dm[2].toLowerCase()]) {
    date = new Date(Date.UTC(Number(dm[3]), MONTHS[dm[2].toLowerCase()] - 1, Number(dm[1]), 6, 0)).toISOString();
  }
  title = title.replace(/^\d{1,2}\s+[а-яіїєґ]+\s+\d{4}\s*(року|р\.)?\s*[;,.:–—-]?\s*/iu, '').trim() || lines[0] || '';
  return { kind: 'video', videoUrl, title, description: lines.join('\n'), date };
}

const MAX_IMAGE_BYTES = 1_500_000;
const imageKey = (id) => `eventimg_${String(id).replace(/[^\w-]/g, '')}`;

/** Розбирає data:image/…;base64 і перевіряє тип та розмір */
function parseImage(dataUrl) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!match) return null;
  const bytes = Math.floor((match[2].length * 3) / 4);
  if (bytes > MAX_IMAGE_BYTES) return { tooLarge: true };
  return { type: match[1], data: match[2] };
}

export function isEventExpired(dateStr) {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    if (!String(dateStr).includes('T') && !String(dateStr).includes(':')) {
      const endOfDay = new Date(dateStr);
      endOfDay.setHours(23, 59, 59, 999);
      return endOfDay < new Date();
    }
    return d < new Date();
  } catch {
    return false;
  }
}

// Тіло запиту обмежене (фото до 1,5 МБ у base64 вміщається), щоб величезними запитами не можна було виснажити сервер
const MAX_BODY_BYTES = 3_500_000;
async function readBody(req) {
  try {
    if (Number(req.headers.get('content-length') || 0) > MAX_BODY_BYTES) return {};
    const reader = req.body?.getReader();
    if (!reader) return {};
    const chunks = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_BODY_BYTES) { await reader.cancel(); return {}; }
      chunks.push(value);
    }
    const parsed = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/** Посилання з адмінки: лише http(s), щоб у базу не потрапили javascript: чи data: */
const isHttpUrl = (value) => {
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
};

export function createParishApi({ readList, writeList }) {
  const facebook = createFacebookContentService(process.env);

  async function loadList(key, seed) {
    const saved = await readList(key);
    if (Array.isArray(saved)) return saved;
    return Array.isArray(seed) ? seed : [];
  }

  async function handleEvents(req, id, sub) {
    const events = await loadList('events', seedEvents);
    if (req.method === 'GET' && !id) return json(events);

    // Публічна віддача фото події
    if (req.method === 'GET' && id && sub === 'image') {
      const [stored] = await loadList(imageKey(id), []);
      if (!stored?.data) return fail(404, 'Фото не знайдено');
      return new Response(Buffer.from(stored.data, 'base64'), {
        headers: { 'Content-Type': stored.type, 'Cache-Control': 'public, max-age=300', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox" }
      });
    }
    if (!isAuthorized(req)) return denied(req);

    if ((req.method === 'DELETE' && id === 'expired') || (req.method === 'POST' && (id === 'cleanup' || id === 'delete-expired'))) {
      const initialCount = events.length;
      const remaining = events.filter((e) => !isEventExpired(e.date));
      const deletedCount = initialCount - remaining.length;
      if (deletedCount > 0) {
        await writeList('events', remaining);
      }
      return json({
        success: true,
        count: deletedCount,
        message: `Видалено ${deletedCount} застарілих подій`
      });
    }

    const index = id ? events.findIndex((event) => event.id === id) : -1;
    if (id && index === -1) return fail(404, 'Подію з таким ID не знайдено');

    if (req.method === 'DELETE' && id) {
      const [deleted] = events.splice(index, 1);
      await writeList('events', events);
      if (deleted.hasImage) await writeList(imageKey(id), []);
      return json({ success: true, message: 'Подію успішно видалено', deletedId: id, deletedTitle: deleted.title });
    }

    if ((req.method === 'POST' && !id) || (req.method === 'PUT' && id)) {
      const body = await readBody(req);
      const fields = { title: text(body.title), date: text(body.date), description: text(body.description), link: text(body.link) };
      if (!fields.title) return fail(400, 'Заголовок події є обов’язковим');
      if (!fields.date) return fail(400, 'Дата та час події є обов’язковими');
      if (fields.link && !isHttpUrl(fields.link)) return fail(400, 'Посилання має починатися з https://');

      // Фото: нове (data URL) або видалення
      const image = body.image ? parseImage(body.image) : null;
      if (body.image && !image) return fail(400, 'Фото має бути у форматі JPG, PNG або WebP');
      if (image?.tooLarge) return fail(400, 'Фото завелике (до 1,5 МБ). Оберіть меншу картинку.');

      const applyImage = async (event) => {
        if (image) {
          await writeList(imageKey(event.id), [{ type: image.type, data: image.data }]);
          return { ...event, hasImage: true, imageUpdatedAt: new Date().toISOString(), imageUrl: undefined };
        }
        if (flag(body.removeImage)) {
          if (event.hasImage) await writeList(imageKey(event.id), []);
          return { ...event, hasImage: false, imageUpdatedAt: undefined, imageUrl: undefined };
        }
        return event;
      };

      if (req.method === 'POST') {
        let event = { id: newId('evt'), ...fields, createdAt: new Date().toISOString() };
        event = await applyImage(event);
        events.unshift(event);
        await writeList('events', events);
        return json({ success: true, message: 'Подію успішно створено', event }, 201);
      }

      events[index] = await applyImage({ ...events[index], ...fields, updatedAt: new Date().toISOString() });
      await writeList('events', events);
      return json({ success: true, message: 'Подію успішно оновлено', event: events[index] });
    }

    return fail(405, 'Метод не підтримується');
  }

  async function handleStreams(req, id) {
    let streams = await loadList('streams', seedStreams);
    if (req.method === 'GET' && !id) return json(streams);
    if (!isAuthorized(req)) return denied(req);

    const index = id ? streams.findIndex((stream) => stream.id === id) : -1;
    if (id && index === -1) return fail(404, 'Ефір з таким ID не знайдено');

    if (req.method === 'DELETE' && id) {
      const [deleted] = streams.splice(index, 1);
      await writeList('streams', streams);
      return json({ success: true, message: 'Ефір успішно видалено', deletedId: id, deletedTitle: deleted.title });
    }

    if (req.method === 'POST' && !id) {
      const body = await readBody(req);
      if (!text(body.title)) return fail(400, 'Назва ефіру є обов\'язковою');
      if (!text(body.videoUrl)) return fail(400, 'URL відео є обов\'язковим');
      if (!isHttpUrl(text(body.videoUrl))) return fail(400, 'Посилання на відео має починатися з https://');
      const isPrimary = flag(body.isPrimary) || streams.length === 0;
      if (isPrimary) streams = streams.map((stream) => ({ ...stream, isPrimary: false }));
      // Одночасно в прямому ефірі може бути лише одна трансляція
      if (flag(body.isLive)) streams = streams.map((stream) => ({ ...stream, isLive: false }));
      const stream = {
        id: newId('str'),
        title: text(body.title),
        videoUrl: text(body.videoUrl),
        description: text(body.description),
        dateLabel: text(body.dateLabel),
        date: text(body.date),
        isLive: flag(body.isLive),
        isPrimary,
        createdAt: new Date().toISOString()
      };
      streams.unshift(stream);
      await writeList('streams', streams);
      return json({ success: true, message: 'Ефір успішно створено', stream }, 201);
    }

    if (req.method === 'PUT' && id) {
      const body = await readBody(req);
      const updates = {};
      for (const key of ['title', 'videoUrl', 'description', 'dateLabel', 'date']) {
        if (body[key] !== undefined) updates[key] = text(body[key]);
      }
      if (updates.videoUrl !== undefined && !isHttpUrl(updates.videoUrl)) return fail(400, 'Посилання на відео має починатися з https://');
      if (body.isLive !== undefined) {
        updates.isLive = flag(body.isLive);
        if (updates.isLive) streams = streams.map((stream, i) => (i === index ? stream : { ...stream, isLive: false }));
      }
      if (body.isPrimary !== undefined) {
        updates.isPrimary = flag(body.isPrimary);
        if (updates.isPrimary) streams = streams.map((stream, i) => (i === index ? stream : { ...stream, isPrimary: false }));
      }
      streams[index] = { ...streams[index], ...updates, updatedAt: new Date().toISOString() };
      await writeList('streams', streams);
      return json({ success: true, message: 'Ефір успішно оновлено', stream: streams[index] });
    }

    return fail(405, 'Метод не підтримується');
  }

  async function handleAdmin(req, action) {
    if (action === 'login' && req.method === 'POST') {
      if (!anyPasswordSet()) return fail(503, 'На хостингу не задано ADMIN_PASSWORD і FORMS_PASSWORD. Додайте їх у налаштуваннях хостингу (Netlify або Vercel).');
      if (limited(req, 'login', 8, 10 * 60 * 1000)) return fail(429, 'Забагато спроб входу. Зачекайте 10 хвилин.');
      const { password } = await readBody(req);
      if (!password) return fail(400, 'Введіть пароль');
      const role = roleForPassword(password);
      if (!role) return fail(401, 'Невірний пароль');
      return json({ success: true, message: 'Авторизація успішна', token: generateToken(role), role });
    }
    const role = roleOf(req);
    if (!role) return fail(401, SESSION_ERROR);
    if (action === 'verify' && req.method === 'GET') return json({ success: true, message: 'Сесія дійсна', role });
    if (action === 'resolve' && req.method === 'POST') {
      if (role !== 'admin') return fail(403, FORBIDDEN_ERROR);
      if (limited(req, 'resolve', 30, 10 * 60 * 1000)) return fail(429, 'Забагато запитів. Зачекайте трохи.');
      const { url } = await readBody(req);
      try {
        const found = await resolveFacebookVideo(url);
        if (!found) return fail(422, 'Не вдалося розпізнати це посилання. Скопіюйте адресу відео зі сторінки Facebook.');
        return json({ success: true, ...found });
      } catch {
        return fail(502, 'Facebook не відповів. Спробуйте ще раз або вставте повну адресу відео.');
      }
    }
    if (action === 'logout' && req.method === 'POST') return json({ success: true, message: 'Успішний вихід із системи' });
    return fail(404, 'Не знайдено');
  }

  async function handleRequests(req, id) {
    // Подати заявку може будь-хто з сайту; переглядати — лише адміністратори
    if (req.method === 'POST' && !id) {
      if (limited(req, 'request', 5, 10 * 60 * 1000)) return fail(429, 'Забагато заявок поспіль. Спробуйте трохи пізніше або зателефонуйте до храму.');
      const body = await readBody(req);
      if (text(body.website)) return json({ success: true, message: 'Заявку прийнято' }, 201); // пастка для ботів
      const captcha = await verifyTurnstile(body.turnstile, clientIp(req));
      if (!captcha.ok) return fail(captcha.reason === 'unavailable' ? 503 : 400, 'Не вдалося підтвердити, що ви не робот. Оновіть сторінку й спробуйте ще раз.');
      const { errors, value } = validateRequest(body);
      if (errors) return json({ success: false, error: 'Перевірте правильність заповнення форми', fields: errors }, 400);
      const list = await loadList('requests', []);
      const entry = { id: newId('req'), ...value, status: 'new', createdAt: new Date().toISOString() };
      list.unshift(entry);
      await writeList('requests', list.slice(0, MAX_REQUESTS));
      await notifyParish('request', entry);
      return json({ success: true, message: 'Заявку надіслано', id: entry.id }, 201);
    }

    if (!canReadRequests(req)) return fail(401, SESSION_ERROR);
    if (req.method === 'DELETE' && !isAuthorized(req)) return fail(403, FORBIDDEN_ERROR);
    const list = await loadList('requests', []);
    if (req.method === 'GET' && !id) return json(list);

    const index = id ? list.findIndex((item) => item.id === id) : -1;
    if (id && index === -1) return fail(404, 'Заявку не знайдено');

    if (req.method === 'PUT' && id) {
      const body = await readBody(req);
      if (!REQUEST_STATUSES.includes(body.status)) return fail(400, 'Невідомий статус заявки');
      list[index] = { ...list[index], status: body.status, updatedAt: new Date().toISOString() };
      await writeList('requests', list);
      return json({ success: true, message: 'Статус оновлено', request: list[index] });
    }

    if (req.method === 'DELETE' && id) {
      if (!isAuthorized(req)) return fail(403, FORBIDDEN_ERROR);
      // Захист від випадкового видалення: лише опрацьовані заявки
      if (list[index].status !== 'done') return fail(409, 'Видалити можна лише опрацьовану заявку. Спершу позначте її як «Опрацьовано».');
      list.splice(index, 1);
      await writeList('requests', list);
      return json({ success: true, message: 'Заявку видалено' });
    }

    return fail(405, 'Метод не підтримується');
  }

  async function handleNotes(req, id) {
    if (req.method === 'POST' && !id) {
      if (limited(req, 'note', 10, 10 * 60 * 1000)) return fail(429, 'Забагато записок поспіль. Спробуйте трохи пізніше.');
      const body = await readBody(req);
      if (text(body.website)) return json({ success: true, message: 'Записку прийнято' }, 201);
      const captcha = await verifyTurnstile(body.turnstile, clientIp(req));
      if (!captcha.ok) return fail(captcha.reason === 'unavailable' ? 503 : 400, 'Не вдалося підтвердити, що ви не робот. Оновіть сторінку й спробуйте ще раз.');
      const { errors, value } = validateNote(body);
      if (errors) return json({ success: false, error: 'Перевірте правильність заповнення', fields: errors }, 400);
      const list = await loadList('notes', []);
      const entry = { id: newId('note'), ...value, status: 'new', createdAt: new Date().toISOString() };
      list.unshift(entry);
      await writeList('notes', list.slice(0, MAX_NOTES));
      await notifyParish('note', entry);
      return json({ success: true, message: 'Записку надіслано', id: entry.id }, 201);
    }

    if (!canReadRequests(req)) return fail(401, SESSION_ERROR);
    if (req.method === 'DELETE' && !isAuthorized(req)) return fail(403, FORBIDDEN_ERROR);
    const list = await loadList('notes', []);
    if (req.method === 'GET' && !id) return json(list);

    const index = id ? list.findIndex((item) => item.id === id) : -1;
    if (id && index === -1) return fail(404, 'Записку не знайдено');

    if (req.method === 'PUT' && id) {
      const body = await readBody(req);
      if (!REQUEST_STATUSES.includes(body.status)) return fail(400, 'Невідомий статус записки');
      list[index] = { ...list[index], status: body.status, updatedAt: new Date().toISOString() };
      await writeList('notes', list);
      return json({ success: true, message: 'Статус оновлено', note: list[index] });
    }

    if (req.method === 'DELETE' && id) {
      if (!isAuthorized(req)) return fail(403, FORBIDDEN_ERROR);
      if (list[index].status !== 'done') return fail(409, 'Видалити можна лише опрацьовану записку. Спершу позначте її як «Опрацьовано».');
      list.splice(index, 1);
      await writeList('notes', list);
      return json({ success: true, message: 'Записку видалено' });
    }

    return fail(405, 'Метод не підтримується');
  }

  async function handleFacebook() {
    try {
      return json(await facebook.getSnapshot());
    } catch {
      return json({ configured: facebook.configured, error: 'Facebook-синхронізація тимчасово недоступна.' }, 503);
    }
  }

  return async (req) => {
    const [resource, id, sub] = new URL(req.url).pathname
      .replace(/^\/apostol(?=\/)/, '')
      .replace(/^\/api\//, '')
      .split('/')
      .filter(Boolean)
      .map(decodeURIComponent);

    try {
      if (resource === 'events') return await handleEvents(req, id, sub);
      if (resource === 'streams') return await handleStreams(req, id);
      if (resource === 'admin') return await handleAdmin(req, id);
      if (resource === 'requests') return await handleRequests(req, id);
      if (resource === 'notes') return await handleNotes(req, id);
      if (resource === 'facebook-content' && req.method === 'GET') return await handleFacebook();
      return fail(404, 'Не знайдено');
    } catch (error) {
      console.error('API error:', error);
      // Зрозумілі адміністратору помилки налаштування сховища показуємо як є
      if (error?.expose) return fail(503, error.message);
      return fail(500, 'Внутрішня помилка сервера');
    }
  };
}
