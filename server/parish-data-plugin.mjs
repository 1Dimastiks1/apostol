import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

function normalizeApiPath(pathname) {
  const stripped = pathname.replace(/^\/apostol(?=\/|$)/, '');
  return stripped || '/';
}

async function sendJsonFile(filePath, fallback, response) {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  try {
    if (!existsSync(filePath)) {
      response.end(JSON.stringify(fallback));
      return;
    }
    const raw = await readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    response.end(JSON.stringify(Array.isArray(parsed) ? parsed : fallback));
  } catch {
    response.end(JSON.stringify(fallback));
  }
}

export function parishDataPlugin(projectRoot) {
  const eventsFile = resolve(projectRoot, 'events.json');
  const streamsFile = resolve(projectRoot, 'streams.json');

  function attach(server) {
    server.middlewares.use(async (request, response, next) => {
      const requestUrl = new URL(request.url || '/', 'http://localhost');
      const path = normalizeApiPath(requestUrl.pathname);
      if (request.method !== 'GET') return next();
      if (path === '/api/events') {
        await sendJsonFile(eventsFile, [], response);
        return;
      }
      if (path === '/api/streams') {
        await sendJsonFile(streamsFile, [], response);
        return;
      }
      next();
    });
  }

  async function readJsonArray(filePath) {
    try {
      const parsed = JSON.parse(await readFile(filePath, 'utf-8'));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return {
    name: 'parish-data-api',
    configureServer: attach,
    configurePreviewServer: attach,
    async generateBundle() {
      for (const [fileName, filePath] of [['data/events.json', eventsFile], ['data/streams.json', streamsFile]]) {
        this.emitFile({ type: 'asset', fileName, source: JSON.stringify(await readJsonArray(filePath), null, 2) });
      }
    }
  };
}
