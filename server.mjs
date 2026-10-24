import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { createFacebookContentService } from './server/facebook-content.mjs';

const outputDirectory = resolve(process.cwd(), 'dist');
const service = createFacebookContentService(process.env);
const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp']
]);

function sendText(response, statusCode, text) {
  response.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(text);
}

async function handleApi(request, response) {
  if (request.method !== 'GET') {
    response.writeHead(405, { Allow: 'GET', 'Cache-Control': 'no-store' });
    response.end('Method Not Allowed');
    return;
  }

  try {
    const payload = await service.getSnapshot();
    response.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff'
    });
    response.end(JSON.stringify(payload));
  } catch {
    response.writeHead(503, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0'
    });
    response.end(JSON.stringify({ configured: service.configured, error: 'Facebook-синхронізація тимчасово недоступна.' }));
  }
}

async function handleStatic(pathname, response) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    sendText(response, 400, 'Bad Request');
    return;
  }

  const sitePath = decodedPath === '/apostol' ? '/' : decodedPath.startsWith('/apostol/') ? decodedPath.slice('/apostol'.length) : decodedPath;
  const relativePath = sitePath.replace(/^\/+/, '') || 'index.html';
  const filePath = resolve(outputDirectory, relativePath);
  if (filePath !== outputDirectory && !filePath.startsWith(`${outputDirectory}${sep}`)) {
    sendText(response, 403, 'Forbidden');
    return;
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      sendText(response, 404, 'Not Found');
      return;
    }
    const body = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': mimeTypes.get(extname(filePath).toLowerCase()) || 'application/octet-stream',
      'Content-Length': body.length,
      'Cache-Control': extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff'
    });
    response.end(body);
  } catch {
    sendText(response, 404, 'Not Found');
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', 'http://localhost');
  const sitePath = url.pathname === '/apostol' ? '/' : url.pathname.startsWith('/apostol/') ? url.pathname.slice('/apostol'.length) : url.pathname;
  if (sitePath === '/api/facebook-content') {
    await handleApi(request, response);
    return;
  }
  await handleStatic(url.pathname, response);
});

const port = Number(process.env.PORT) || 4173;
const host = process.env.HOST || '127.0.0.1';
service.start();
server.listen(port, host, () => {
  console.log(`Петропавлівський храм доступний: http://${host}:${port}/apostol/`);
  console.log(service.configured ? 'Автоматична синхронізація Facebook увімкнена.' : 'Facebook API ще не підключено: потрібні токени у .env.');
});

server.on('close', () => service.stop());
process.on('SIGINT', () => server.close(() => process.exit(0)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
