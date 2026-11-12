/**
 * SEO під час збірки: підставляє адресу сайту в canonical/Open Graph, створює robots.txt і sitemap.xml.
 * Адреса береться зі змінної SITE_URL (наприклад https://petropavlivska.church) або з даних хостингу
 * (Vercel/Netlify). Якщо її немає, посилання з абсолютними адресами просто не додаються.
 */
const clean = (value) => String(value || '').trim().replace(/\/+$/, '');

export function resolveSiteUrl(env = process.env) {
  if (env.SITE_URL) return clean(env.SITE_URL);
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${clean(env.VERCEL_PROJECT_PRODUCTION_URL)}`;
  if (env.URL && env.NETLIFY) return clean(env.URL);
  return '';
}

export function seoPlugin() {
  let siteUrl = '';
  let base = '/';
  return {
    name: 'parish-seo',
    configResolved(config) {
      base = config.base || '/';
      siteUrl = resolveSiteUrl(process.env);
      if (config.command === 'build' && !siteUrl) {
        console.warn('\n[seo] SITE_URL не задано: canonical, og:url і sitemap.xml не створюються. Додайте SITE_URL=https://ваш-домен у налаштуваннях хостингу.\n');
      }
    },
    transformIndexHtml(html, ctx) {
      // Підтвердження власності в Google Search Console (значення з налаштувань хостингу)
      const verify = String(process.env.GOOGLE_SITE_VERIFICATION || '').trim().replace(/[^\w-]/g, '');
      if (verify && ctx?.filename?.endsWith('index.html')) html = html.replace('</head>', `  <meta name="google-site-verification" content="${verify}">\n</head>`);
      const root = siteUrl ? `${siteUrl}${base === '/' ? '' : base.replace(/\/$/, '')}` : '';
      // Без адреси сайту прибираємо теги з абсолютними посиланнями, а в розмітці JSON-LD лишаємо відносні адреси
      if (!root) return html.replace(/^[ \t]*<(?:meta|link)[^\n]*__SITE_URL__[^\n]*\n/gm, '').replaceAll('__SITE_URL__', '');
      return html.replaceAll('__SITE_URL__', root);
    },
    generateBundle() {
      const origin = siteUrl;
      const path = base === '/' ? '' : base.replace(/\/$/, '');
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: [
          'User-agent: *',
          'Allow: /',
          'Disallow: /admin',
          'Disallow: /admin.html',
          'Disallow: /api/',
          origin ? `Sitemap: ${origin}${path}/sitemap.xml` : '',
          '',
        ].filter((line, i, all) => line !== '' || i === all.length - 1).join('\n'),
      });
      if (origin) {
        const today = new Date().toISOString().slice(0, 10);
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[['/', 'weekly', '1.0'], ['/privacy', 'yearly', '0.3'], ['/terms', 'yearly', '0.3']].map(([u, f, p]) => `  <url>\n    <loc>${origin}${path}${u}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${f}</changefreq>\n    <priority>${p}</priority>\n  </url>`).join('\n')}\n</urlset>\n`,
        });
      }
    },
  };
}
