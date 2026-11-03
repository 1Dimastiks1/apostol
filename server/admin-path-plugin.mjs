/**
 * Сховуємо адмінку за нестандартними адресами (змінні ADMIN_PATH і FORMS_PATH, наприклад vkhid-k3x9q2).
 * Під час збірки файл admin.html перейменовується в <шлях>.html, тож /admin більше не існує.
 * Пароль усе одно потрібен: адреса лише робить сторінку входу невидимою для сторонніх.
 */
const VALID = /^[a-z0-9][a-z0-9_-]{4,60}$/i;

export function adminPaths(env = process.env) {
  return [env.ADMIN_PATH, env.FORMS_PATH]
    .map((v) => String(v || '').trim().replace(/^\/+|\/+$/g, ''))
    .filter((v, i, all) => VALID.test(v) && all.indexOf(v) === i);
}

export function adminPathPlugin() {
  return {
    name: 'parish-admin-path',
    apply: 'build',
    generateBundle: {
      order: 'post',
      handler(_, bundle) {
        const paths = adminPaths();
        const page = bundle['admin.html'];
        if (!paths.length || !page) return;
        for (const name of paths) this.emitFile({ type: 'asset', fileName: `${name}.html`, source: page.source });
        delete bundle['admin.html'];
      },
    },
  };
}
