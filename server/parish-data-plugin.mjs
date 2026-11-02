import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createParishApi } from './parish-api.mjs';

function normalizeApiPath(pathname) {
  const stripped = pathname.replace(/^\/apostol(?=\/|$)/, '');
  return stripped || '/';
}

/** Файлове сховище: події та ефіри поруч із проєктом, заявки — у прихованій папці поза git */
export function createFileStore(projectRoot) {
  const files = {
    events: resolve(projectRoot, 'events.json'),
    streams: resolve(projectRoot, 'streams.json'),
    requests: resolve(projectRoot, '.private-data', 'requests.json'),
    notes: resolve(projectRoot, '.private-data', 'notes.json')
  };
  // Фото подій: окремий файл на кожне, у закритій папці (віддаються лише через API)
  const fileFor = (key) => (/^eventimg_[\w-]+$/.test(key) ? resolve(projectRoot, '.private-data', 'event-images', `${key}.json`) : files[key]);
  return {
    async readList(key) {
      const file = fileFor(key);
      if (!file || !existsSync(file)) return [];
      try {
        const parsed = JSON.parse(await readFile(file, 'utf-8'));
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    },
    async writeList(key, list) {
      const file = fileFor(key);
      if (!file) throw new Error(`Unknown data key: ${key}`);
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, JSON.stringify(list, null, 2), 'utf-8');
    }
  };
}

export function parishDataPlugin(projectRoot) {
  const eventsFile = resolve(projectRoot, 'events.json');
  const streamsFile = resolve(projectRoot, 'streams.json');
  const parishApi = createParishApi(createFileStore(projectRoot));

  function attach(server) {
    server.middlewares.use(async (request, response, next) => {
      const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
      const path = normalizeApiPath(requestUrl.pathname);
      // Заявки з телефонами не можна віддавати як статичний файл
      if (requestUrl.pathname.includes('/.private-data')) {
        response.statusCode = 404;
        return response.end();
      }
      if (!path.startsWith('/api/')) return next();

      try {
        let body = undefined;
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
          const buffers = [];
          for await (const chunk of request) {
            buffers.push(chunk);
          }
          if (buffers.length > 0) {
            body = Buffer.concat(buffers);
          }
        }

        const headers = new Headers();
        for (const [key, val] of Object.entries(request.headers)) {
          if (val) headers.set(key, Array.isArray(val) ? val.join(', ') : val);
        }

        const fetchReq = new Request(new URL(path, requestUrl.origin), {
          method: request.method,
          headers,
          body
        });

        const apiRes = await parishApi(fetchReq);
        response.statusCode = apiRes.status;
        for (const [k, v] of apiRes.headers.entries()) {
          response.setHeader(k, v);
        }
        response.end(Buffer.from(await apiRes.arrayBuffer()));
      } catch (err) {
        next(err);
      }
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
