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
    transformIndexHtml(html) {
      const root = siteUrl ? `${siteUrl}${base === '/' ? '' : base.replace(/\/$/, '')}` : '';
      if (!root) return html.replace(/^.*__SITE_URL__.*\n/gm, '');
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
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${origin}${path}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
        });
      }
    },
  };
}
