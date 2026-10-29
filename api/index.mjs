import { BlobNotFoundError, get, head, put } from '@vercel/blob';
import { createParishApi } from '../server/parish-api.mjs';

const pathname = (key) => `parish-data/${key}.json`;
const hasBlobCredentials = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

// A Blob store is either private or public; the mode is remembered once a read finds data or a write succeeds.
let access = process.env.BLOB_ACCESS || null;
const accessOrder = () => (access ? [access] : ['private', 'public']);

async function withAccess(operation) {
  let lastError;
  for (const mode of accessOrder()) {
    try {
      const result = await operation(mode);
      if (result !== null) access = mode;
      return result;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function readBlob(key, mode) {
  if (mode === 'private') {
    const result = await get(pathname(key), { access: 'private', useCache: false });
    if (!result) return null;
    return new Response(result.stream).text();
  }
  let meta;
  try {
    meta = await head(pathname(key));
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  }
  const res = await fetch(`${meta.url}?v=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Blob fetch failed: ${res.status}`);
  return res.text();
}

const parishApi = createParishApi({
  async readList(key) {
    if (!hasBlobCredentials()) return null;
    const text = await withAccess((mode) => readBlob(key, mode));
    return text === null ? null : JSON.parse(text);
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
