import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { facebookContentPlugin } from './server/facebook-content.mjs'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [tailwindcss(), facebookContentPlugin({ ...process.env, ...env })],
    base: process.env.NETLIFY ? '/' : (process.env.BASE_URL || '/apostol/'),
    build: {
      rolldownOptions: {
        input: {
          index: resolve(projectRoot, 'index.html'),
          standalone: resolve(projectRoot, 'parish-standalone.html')
        }
      }
    }
  };
});
