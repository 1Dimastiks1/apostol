import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createParishApi } from './parish-api.mjs';

function normalizeApiPath(pathname) {
  const stripped = pathname.replace(/^\/apostol(?=\/|$)/, '');
  return stripped || '/';
}

export function parishDataPlugin(projectRoot) {
  const eventsFile = resolve(projectRoot, 'events.json');
  const streamsFile = resolve(projectRoot, 'streams.json');

  const parishApi = createParishApi({
    async readList(key) {
      const file = key === 'events' ? eventsFile : streamsFile;
      if (!existsSync(file)) return [];
      try {
        const raw = await readFile(file, 'utf-8');
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    },
    async writeList(key, list) {
      const file = key === 'events' ? eventsFile : streamsFile;
      await writeFile(file, JSON.stringify(list, null, 2), 'utf-8');
    }
  });

  function attach(server) {
    server.middlewares.use(async (request, response, next) => {
      const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
      const path = normalizeApiPath(requestUrl.pathname);
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
        const text = await apiRes.text();
        response.end(text);
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
