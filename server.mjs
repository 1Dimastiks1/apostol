import express from 'express';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { Readable } from 'node:stream';
import { createFacebookContentService } from './server/facebook-content.mjs';
import { createParishApi } from './server/parish-api.mjs';
import { createFileStore } from './server/parish-data-plugin.mjs';
import { adminPaths } from './server/admin-path-plugin.mjs';

const app = express();
const port = Number(process.env.PORT) || 4173;
const host = process.env.HOST || '127.0.0.1';

const ROOT = process.cwd();
const DIST_DIR = resolve(ROOT, 'dist');
const PUBLIC_DIR = resolve(ROOT, 'public');

// Спільний API (той самий, що на Netlify, Vercel і в dev-режимі): події, ефіри, заявки, вхід адміністраторів
const parishApi = createParishApi(createFileStore(ROOT));

// Фонова синхронізація Facebook
const service = createFacebookContentService(process.env);

// Захисні заголовки для всіх відповідей
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; frame-src https://www.facebook.com https://web.facebook.com https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://maps.google.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
  next();
});

// Приховані дані (заявки) ніколи не віддаються як статичні файли
app.use((req, res, next) => (req.path.includes('/.private-data') ? res.sendStatus(404) : next()));

app.use(['/api', '/apostol/api'], async (req, res, next) => {
  try {
    const url = new URL(req.originalUrl, `http://${req.headers.host || 'localhost'}`);
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
    // Без проксі адресу відвідувача беремо із сокета, щоб працювали ліміти спроб входу й заявок
    if (!headers.get('x-forwarded-for') && !headers.get('x-real-ip')) headers.set('x-real-ip', req.socket.remoteAddress || 'unknown');
    const hasBody = !['GET', 'HEAD'].includes(req.method);
    const apiRes = await parishApi(new Request(url, {
      method: req.method,
      headers,
      body: hasBody ? Readable.toWeb(req) : undefined,
      duplex: hasBody ? 'half' : undefined
    }));
    res.status(apiRes.status);
    apiRes.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(Buffer.from(await apiRes.arrayBuffer()));
  } catch (error) {
    next(error);
  }
});

// Адмін-панель: зібрана версія з dist, інакше вихідний файл
const sendAdminHtml = (req, res) => {
  for (const file of [join(DIST_DIR, 'admin.html'), resolve(ROOT, 'admin.html')]) {
    if (existsSync(file)) return res.sendFile(file);
  }
  res.status(404).send('Файл admin.html не знайдено.');
};
// Якщо задано ADMIN_PATH / FORMS_PATH, адмінка доступна лише за цими адресами, а /admin не існує
const secretPaths = adminPaths();
if (secretPaths.length) {
  for (const name of secretPaths) {
    app.get([`/${name}`, `/apostol/${name}`], (req, res) => {
      const file = join(DIST_DIR, `${name}.html`);
      return existsSync(file) ? res.sendFile(file) : res.status(404).send('Не знайдено');
    });
  }
  app.get(['/admin', '/admin.html', '/apostol/admin', '/apostol/admin.html'], (req, res) => res.status(404).sendFile(join(DIST_DIR, '404.html')));
} else {
  app.get(['/admin', '/admin.html', '/apostol/admin', '/apostol/admin.html'], sendAdminHtml);
}

// Статичні файли: dist (після npm run build), потім public
for (const dir of [DIST_DIR, PUBLIC_DIR]) {
  if (existsSync(dir)) {
    app.use(express.static(dir));
    app.use('/apostol', express.static(dir));
  }
}

app.get(['/', '/apostol', '/apostol/'], (req, res) => {
  const distIndex = join(DIST_DIR, 'index.html');
  if (existsSync(distIndex)) return res.sendFile(distIndex);
  res.status(404).send('Спершу зберіть сайт: npm run build');
});

// Усе інше: гарна сторінка 404
app.use((req, res) => {
  const page = join(DIST_DIR, '404.html');
  if (existsSync(page)) return res.status(404).sendFile(page);
  res.status(404).send('Не знайдено');
});

service.start();

const server = app.listen(port, host, () => {
  console.log('\n======================================================');
  console.log(' Петропавлівський храм — сервер запущено успішно!');
  console.log(` Головний сайт:   http://${host}:${port}/ (або /apostol/)`);
  console.log(` Адмін-панель:    http://${host}:${port}/${secretPaths[0] || 'admin'}`);
  console.log(` Паролі адмінки:  ${process.env.ADMIN_PASSWORD ? 'ADMIN_PASSWORD задано' : 'ADMIN_PASSWORD не задано'} · ${process.env.FORMS_PASSWORD ? 'FORMS_PASSWORD задано' : 'FORMS_PASSWORD не задано'} (.env)`);
  console.log('======================================================\n');
  console.log(service.configured ? 'Автоматична синхронізація Facebook увімкнена.' : 'Facebook API: токени відсутні у .env (працює у резервному режимі).');
});

server.on('close', () => service.stop());
process.on('SIGINT', () => server.close(() => process.exit(0)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
