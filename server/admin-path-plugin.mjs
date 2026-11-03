/**
 * Сховуємо адмінку за нестандартними адресами (змінні ADMIN_PATH і FORMS_PATH, наприклад vkhid-k3x9q2).
 * Під час збірки файл admin.html перейменовується в <шлях>.html, тож /admin більше не існує.
 * Для кожної адреси створюється і свій manifest (<шлях>.webmanifest), щоб адмінку можна було встановити
 * як окрему програму; він лежить поруч зі сторінкою й ніде публічно не згадується.
 * Пароль усе одно потрібен: адреса лише робить сторінку входу невидимою для сторонніх.
 */
const VALID = /^[a-z0-9][a-z0-9_-]{4,60}$/i;
const PLACEHOLDER = '__ADMIN_MANIFEST__';

export function adminPaths(env = process.env) {
  return [env.ADMIN_PATH, env.FORMS_PATH]
    .map((v) => String(v || '').trim().replace(/^\/+|\/+$/g, ''))
    .filter((v, i, all) => VALID.test(v) && all.indexOf(v) === i);
}

const manifest = (name, startUrl) => JSON.stringify({
  name: 'Адмін · Петропавлівський храм',
  short_name: 'Адмін храму',
  description: 'Заявки, записки, ефіри та події парафії.',
  lang: 'uk',
  id: `./${startUrl}`,
  start_url: `./${startUrl}`,
  scope: './',
  display: 'standalone',
  orientation: 'any',
  background_color: '#0f0706',
  theme_color: '#0f0706',
  icons: [
    { src: 'icons/admin-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icons/admin-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icons/admin-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}, null, 2);

export function adminPathPlugin() {
  let base = '/';
  return {
    name: 'parish-admin-path',
    apply: 'build',
    configResolved(config) { base = config.base || '/'; },
    // Посилання на manifest додаємо вже після обробки HTML, а справжню адресу підставляємо нижче для кожної копії
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.filename.endsWith('admin.html')) return html;
        return html.replace('</head>', `  <link rel="manifest" href="${PLACEHOLDER}">\n</head>`);
      },
    },
    generateBundle: {
      order: 'post',
      handler(_, bundle) {
        const page = bundle['admin.html'];
        if (!page) return;
        const source = String(page.source);
        const paths = adminPaths();
        if (!paths.length) {
          page.source = source.replace(PLACEHOLDER, `${base}admin.webmanifest`);
          this.emitFile({ type: 'asset', fileName: 'admin.webmanifest', source: manifest('admin', 'admin.html') });
          return;
        }
        for (const name of paths) {
          this.emitFile({ type: 'asset', fileName: `${name}.html`, source: source.replace(PLACEHOLDER, `${base}${name}.webmanifest`) });
          this.emitFile({ type: 'asset', fileName: `${name}.webmanifest`, source: manifest(name, name) });
        }
        delete bundle['admin.html'];
      },
    },
  };
}
