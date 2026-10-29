import { getStore } from '@netlify/blobs';
import { createParishApi } from '../../server/parish-api.mjs';

const store = () => getStore({ name: 'parish-data', consistency: 'strong' });

export default createParishApi({
  readList: (key) => store().get(key, { type: 'json' }),
  writeList: (key, list) => store().setJSON(key, list)
});

export const config = { path: ['/api/*', '/apostol/api/*'] };
