import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { facebookContentPlugin } from './server/facebook-content.mjs'
import { parishDataPlugin } from './server/parish-data-plugin.mjs'
import { seoPlugin } from './server/seo-plugin.mjs'
import { adminPathPlugin } from './server/admin-path-plugin.mjs'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Серверний API читає паролі адмінки з process.env — передаємо їх із .env у dev-режимі
  for (const key of ['ADMIN_PASSWORD', 'FORMS_PASSWORD', 'SESSION_SECRET', 'ADMIN_PATH', 'FORMS_PATH', 'TURNSTILE_SECRET_KEY', 'RESEND_API_KEY', 'NOTIFY_EMAIL_TO', 'NOTIFY_EMAIL_FROM']) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      facebookContentPlugin({ ...process.env, ...env }),
      parishDataPlugin(projectRoot),
      seoPlugin(),
      adminPathPlugin()
    ],
    server: {
      // Дані адмінки змінюються під час роботи — це не привід перезапускати dev-сервер
      watch: { ignored: ['**/events.json', '**/streams.json', '**/.private-data/**'] },
      fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/.private-data/**'] }
    },
    resolve: {
      alias: { '@': resolve(projectRoot, 'src') }
    },
    base: process.env.NETLIFY || process.env.VERCEL ? '/' : (process.env.BASE_URL || '/apostol/'),
    build: {
      rolldownOptions: {
        input: {
          index: resolve(projectRoot, 'index.html'),
          standalone: resolve(projectRoot, 'parish-standalone.html'),
          admin: resolve(projectRoot, 'admin.html')
        }
      }
    }
  };
});
