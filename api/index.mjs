import { BlobAccessError, get, put } from '@vercel/blob';
import { createParishApi } from '../server/parish-api.mjs';

let access = process.env.BLOB_ACCESS || null;
const accessOrder = () => (access ? [access] : ['private', 'public']);
const pathname = (key) => `parish-data/${key}.json`;
const hasBlobCredentials = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

async function withAccess(operation) {
  let lastError;
  for (const mode of accessOrder()) {
    try {
      const result = await operation(mode);
      access = mode;
      return result;
    } catch (error) {
      if (!(error instanceof BlobAccessError) && !/access/i.test(error?.message || '')) throw error;
      lastError = error;
    }
  }
  throw lastError;
}

const parishApi = createParishApi({
  async readList(key) {
    if (!hasBlobCredentials()) return null;
    const result = await withAccess((mode) => get(pathname(key), { access: mode, useCache: false }));
    if (!result || result.statusCode !== 200) return null;
    return JSON.parse(await new Response(result.stream).text());
  },
  async writeList(key, list) {
    if (!hasBlobCredentials()) throw new Error('Vercel Blob store is not connected to this project');
    await withAccess((mode) => put(pathname(key), JSON.stringify(list), {
      access: mode,
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: 'application/json',
      cacheControlMaxAge: 60
    }));
  }
});

function handle(req) {
  const url = new URL(req.url);
  const path = url.searchParams.get('__path');
  if (path === null) return parishApi(req);
  url.searchParams.delete('__path');
  url.pathname = `/api/${path}`;
  return parishApi(new Request(url, req));
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
