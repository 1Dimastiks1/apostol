import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';
import seedEvents from '../../events.json' with { type: 'json' };
import seedStreams from '../../streams.json' with { type: 'json' };
import { createFacebookContentService } from '../../server/facebook-content.mjs';

const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const facebook = createFacebookContentService(process.env);

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
});

const fail = (status, error) => json({ success: false, error }, status);

const adminPassword = () => process.env.ADMIN_PASSWORD || '';
const sessionSecret = () => process.env.SESSION_SECRET || `apostol_secret_key_${adminPassword()}`;
const sign = (payload) => crypto.createHmac('sha256', sessionSecret()).update(payload).digest('hex');

function generateToken() {
  const payload = `${Date.now()}:${crypto.randomBytes(16).toString('hex')}`;
  return `${payload}:${sign(payload)}`;
}

function verifyToken(token) {
  const parts = String(token || '').split(':');
  if (parts.length !== 3 || !adminPassword()) return false;
  const [timestamp, random, signature] = parts;
  const expected = sign(`${timestamp}:${random}`);
  if (signature.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  const issuedAt = Number(timestamp);
  return Number.isFinite(issuedAt) && Date.now() - issuedAt <= TOKEN_MAX_AGE_MS;
}

function isAuthorized(req) {
  const header = req.headers.get('authorization') || '';
  return header.startsWith('Bearer ') && verifyToken(header.slice(7).trim());
}

const store = () => getStore({ name: 'parish-data', consistency: 'strong' });

async function readList(key, seed) {
  const saved = await store().get(key, { type: 'json' });
  if (Array.isArray(saved)) return saved;
  return Array.isArray(seed) ? seed : [];
}

const writeList = (key, list) => store().setJSON(key, list);

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const flag = (value) => value === true || value === 'true';
const newId = (prefix) => `${prefix}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

async function readBody(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

async function handleEvents(req, id) {
  const events = await readList('events', seedEvents);
  if (req.method === 'GET' && !id) return json(events);
  if (!isAuthorized(req)) return fail(401, 'Сесія недійсна або термін її дії закінчився. Будь ласка, увійдіть знову.');

  const index = id ? events.findIndex((event) => event.id === id) : -1;
  if (id && index === -1) return fail(404, 'Подію з таким ID не знайдено');

  if (req.method === 'DELETE' && id) {
    const [deleted] = events.splice(index, 1);
    await writeList('events', events);
    return json({ success: true, message: 'Подію успішно видалено', deletedId: id, deletedTitle: deleted.title });
  }

  if ((req.method === 'POST' && !id) || (req.method === 'PUT' && id)) {
    const body = await readBody(req);
    const fields = { title: text(body.title), date: text(body.date), description: text(body.description), link: text(body.link) };
    if (!fields.title) return fail(400, 'Заголовок події є обов’язковим');
    if (!fields.date) return fail(400, 'Дата та час події є обов’язковими');

    if (req.method === 'POST') {
      const event = { id: newId('evt'), ...fields, createdAt: new Date().toISOString() };
      events.unshift(event);
      await writeList('events', events);
      return json({ success: true, message: 'Подію успішно створено', event }, 201);
    }

    events[index] = { ...events[index], ...fields, updatedAt: new Date().toISOString() };
    await writeList('events', events);
    return json({ success: true, message: 'Подію успішно оновлено', event: events[index] });
  }

  return fail(405, 'Метод не підтримується');
}

async function handleStreams(req, id) {
  let streams = await readList('streams', seedStreams);
  if (req.method === 'GET' && !id) return json(streams);
  if (!isAuthorized(req)) return fail(401, 'Сесія недійсна або термін її дії закінчився. Будь ласка, увійдіть знову.');

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
    const isPrimary = flag(body.isPrimary) || streams.length === 0;
    if (isPrimary) streams = streams.map((stream) => ({ ...stream, isPrimary: false }));
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
    if (body.isLive !== undefined) updates.isLive = flag(body.isLive);
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
    if (!adminPassword()) return fail(503, 'На хостингу не задано ADMIN_PASSWORD. Додайте його в налаштуваннях Netlify.');
    const { password } = await readBody(req);
    if (!password) return fail(400, 'Введіть пароль');
    if (password !== adminPassword()) return fail(401, 'Невірний пароль адміністратора');
    return json({ success: true, message: 'Авторизація успішна', token: generateToken() });
  }
  if (!isAuthorized(req)) return fail(401, 'Сесія недійсна або термін її дії закінчився. Будь ласка, увійдіть знову.');
  if (action === 'verify' && req.method === 'GET') return json({ success: true, message: 'Сесія дійсна' });
  if (action === 'logout' && req.method === 'POST') return json({ success: true, message: 'Успішний вихід із системи' });
  return fail(404, 'Не знайдено');
}

async function handleFacebook() {
  try {
    return json(await facebook.getSnapshot());
  } catch {
    return json({ configured: facebook.configured, error: 'Facebook-синхронізація тимчасово недоступна.' }, 503);
  }
}

export default async (req) => {
  const [resource, id] = new URL(req.url).pathname
    .replace(/^\/apostol(?=\/)/, '')
    .replace(/^\/api\//, '')
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);

  try {
    if (resource === 'events') return await handleEvents(req, id);
    if (resource === 'streams') return await handleStreams(req, id);
    if (resource === 'admin') return await handleAdmin(req, id);
    if (resource === 'facebook-content' && req.method === 'GET') return await handleFacebook();
    return fail(404, 'Не знайдено');
  } catch (error) {
    console.error('API error:', error);
    return fail(500, 'Внутрішня помилка сервера');
  }
};

export const config = { path: ['/api/*', '/apostol/api/*'] };
