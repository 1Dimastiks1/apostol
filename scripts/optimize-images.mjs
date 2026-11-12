// Створює стислі WebP-копії всіх фото з public/images (оригінали лишаються для соцмереж і як резерв).
// Запуск після додавання нових фото: npm run images
import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('../public/images', import.meta.url));
const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });

let before = 0, after = 0;
for (const file of walk(ROOT).filter((f) => /\.(jpe?g|png)$/i.test(f))) {
  const out = file.slice(0, -extname(file).length) + '.webp';
  const info = await sharp(file).rotate().resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 66, effort: 6 }).toFile(out);
  before += statSync(file).size; after += info.size;
  console.log(`✓ ${file.slice(ROOT.length + 1)} → ${Math.round(info.size / 1024)} КБ`);
}
console.log(`\nРазом: ${Math.round(before / 1024 / 1024 * 10) / 10} МБ → ${Math.round(after / 1024 / 1024 * 10) / 10} МБ`);
