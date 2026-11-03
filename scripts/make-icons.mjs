// Малює іконки застосунку: фото нашого храму (як у першому екрані) в арці на бордовому тлі із золотими елементами.
// Запуск: node scripts/make-icons.mjs (потрібен macOS: для читання фото використовується системна утиліта sips)
import { deflateSync, inflateSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const body = Buffer.concat([Buffer.from(type), data]); const sum = Buffer.alloc(4); sum.writeUInt32BE(crc(body)); return Buffer.concat([len, body, sum]); };
const png = (w, h, rgb) => {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
};

/** Читає PNG (8 біт, RGB або RGBA, без перемежування) у масив пікселів */
function decodePng(buf) {
  let pos = 8, w = 0, h = 0, ct = 0; const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), type = buf.toString('ascii', pos + 4, pos + 8), data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); ct = data[9]; }
    if (type === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  const bpp = ct === 6 ? 4 : 3, stride = w * bpp, raw = inflateSync(Buffer.concat(idat)), out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = y * (stride + 1) + 1, dst = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[dst + x - bpp] : 0, b = y ? out[dst - stride + x] : 0, c = x >= bpp && y ? out[dst - stride + x - bpp] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const v = raw[src + x] + (f === 0 ? 0 : f === 1 ? a : f === 2 ? b : f === 3 ? (a + b) >> 1 : pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
      out[dst + x] = v & 255;
    }
  }
  return { w, h, bpp, px: out };
}

const tmp = mkdtempSync(join(tmpdir(), 'icons-'));
execFileSync('sips', ['-s', 'format', 'png', fileURLToPath(new URL('../public/images/church-exterior-old-town.jpg', import.meta.url)), '--out', join(tmp, 'hero.png')], { stdio: 'ignore' });
const photo = decodePng(readFileSync(join(tmp, 'hero.png')));

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const WINE = [118, 26, 34], DEEP = [28, 5, 8];
const G1 = [250, 232, 176], G2 = [214, 175, 94], G3 = [150, 110, 44];
const goldAt = (t) => (t < 0.5 ? mix(G1, G2, clamp(t) * 2) : mix(G2, G3, clamp((t - 0.5) * 2)));
const sample = (u, v) => { // білінійна вибірка фото, u і v в одиницях пікселів фото
  const x = clamp(u, 0, photo.w - 1.001), y = clamp(v, 0, photo.h - 1.001), x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
  const at = (xx, yy, k) => photo.px[(yy * photo.w + xx) * photo.bpp + k];
  return [0, 1, 2].map((k) => (at(x0, y0, k) * (1 - fx) + at(x0 + 1, y0, k) * fx) * (1 - fy) + (at(x0, y0 + 1, k) * (1 - fx) + at(x0 + 1, y0 + 1, k) * fx) * fy);
};

/** safe — частка, у яку вписано малюнок (менша для maskable); badge — значок із замком для адмінки */
function render(size, safe, badge) {
  const SS = 2, N = size * SS, px = new Float32Array(N * N * 3);
  const s = N * safe, o = (N - s) / 2, cx = N / 2;
  const X = (u) => o + u * s, Y = (v) => o + v * s;
  // арка (як у першому екрані сайту): півколо зверху, прямі боки
  const aw = 0.345, top = 0.115, bottom = 0.945, ar = aw * s, ac = Y(top) + ar;
  const archSd = (x, y, grow = 0) => { const r = ar + grow * s; return y <= ac ? Math.hypot(x - cx, y - ac) - r : Math.abs(x - cx) - r; };
  const inArch = (x, y) => y <= Y(bottom) && archSd(x, y) <= 0;
  const edge = (x, y, grow, w) => Math.abs(archSd(x, y, grow)) < w && y <= Y(bottom) + grow * s * 0.3;
  const thin = N * 0.005, thick = N * 0.0125;
  const winH = Y(bottom) - Y(top);
  const scale = Math.max((2 * ar) / (photo.w * 0.76), winH / photo.h);
  const focusU = photo.w * 0.5, focusV = photo.h * 0.5;
  const rayC = [cx, ac];
  const cross = [[cx, Y(0.012), cx, Y(0.088)], [cx - s * 0.026, Y(0.036), cx + s * 0.026, Y(0.036)], [cx - s * 0.016, Y(0.07), cx + s * 0.016, Y(0.062)]];
  const seg = (x, y, x1, y1, x2, y2) => { const dx = x2 - x1, dy = y2 - y1; const t = clamp(((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)); return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy)); };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let c = mix(WINE, DEEP, clamp((x * 0.4 + y) / (N * 1.3)));
    const glow = Math.max(0, 1 - Math.hypot(x - cx, y - Y(0.45)) / (s * 0.78));
    c = mix(c, [220, 165, 92], glow * glow * 0.34);
    // золоті промені від арки
    const ang = Math.atan2(y - rayC[1], x - rayC[0]), dist = Math.hypot(x - rayC[0], y - rayC[1]);
    const ray = Math.max(0, Math.cos(ang * 14)) ** 6 * clamp(1 - Math.abs(dist - s * 0.62) / (s * 0.55)) * (dist > ar ? 1 : 0);
    c = mix(c, [246, 220, 150], ray * 0.16);
    if (edge(x, y, 0.05, thin)) c = mix(c, goldAt(y / N), 0.75); // зовнішня тонка арка
    if (inArch(x, y)) {
      const u = focusU + (x - cx) / scale, v = focusV + (y - (Y(top) + winH / 2)) / scale;
      c = sample(u, v);
      c = c.map((k) => clamp((k / 255 - 0.5) * 1.1 + 0.5 + 0.015) * 255); // трохи контрасту
      c = mix(c, [255, 214, 140], 0.05); // тепла золотава нота
      const fade = clamp((y - Y(0.66)) / (s * 0.3));
      c = mix(c, DEEP, fade * 0.6); // бордове затемнення знизу
      const vign = clamp(Math.hypot((x - cx) / (ar * 1.25), (y - (Y(top) + winH * 0.55)) / (winH * 0.7)) - 0.55);
      c = mix(c, DEEP, vign * 0.35); // віньєтка
    }
    if (edge(x, y, 0, thick)) {
      const sheen = clamp(1 - Math.abs((x - cx) * 0.8 + (y - Y(0.4)) * 0.6 + s * 0.1) / (s * 0.25));
      c = mix(goldAt((y - Y(top)) / (winH * 1.1)), [255, 248, 215], sheen * 0.55); // золото з відблиском
    }
    // золотий хрестик над аркою, ромби по боках і орнамент знизу
    if (Math.min(...cross.map((l) => seg(x, y, ...l))) < N * 0.0075) c = goldAt(0.2);
    const dia = (px0, py0, r) => Math.abs(x - px0) + Math.abs(y - py0) < r;
    if (dia(X(0.03), Y(0.55), s * 0.02) || dia(X(0.97), Y(0.55), s * 0.02) || dia(cx, Y(0.985), s * 0.024)) c = goldAt(0.3);
    if (Math.abs(y - Y(0.985)) < thin * 1.1 && Math.abs(x - cx) < s * 0.2 && Math.abs(x - cx) > s * 0.04) c = goldAt(0.55);
    if (badge) {
      const bx = N * (0.5 + safe * 0.33), by = N * (0.5 + safe * 0.33), br = N * safe * 0.17, bd = Math.hypot(x - bx, y - by);
      if (bd < br + N * 0.012) c = DEEP;
      if (bd < br) {
        c = mix(goldAt((y - (by - br)) / (br * 2)), [255, 244, 205], clamp(1 - Math.hypot(x - (bx - br * 0.4), y - (by - br * 0.4)) / br) * 0.3);
        const lw2 = br * 0.62, lh = br * 0.48, ly = by - br * 0.05;
        const inBody = Math.abs(x - bx) <= lw2 / 2 && y >= ly && y <= ly + lh;
        const shackle = Math.abs(Math.hypot(x - bx, y - ly) - br * 0.24) < br * 0.07 && y <= ly;
        const hole = Math.hypot(x - bx, y - (ly + lh * 0.42)) < br * 0.07;
        if ((inBody && !hole) || shackle) c = [44, 9, 12];
      }
    }
    const i = (y * N + x) * 3; px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2];
  }
  const out = Buffer.alloc(size * size * 3);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) for (let k = 0; k < 3; k++) {
    let sum = 0;
    for (let dy = 0; dy < SS; dy++) for (let dx = 0; dx < SS; dx++) sum += px[(((y * SS + dy) * N) + x * SS + dx) * 3 + k];
    out[(y * size + x) * 3 + k] = Math.round(sum / (SS * SS));
  }
  return png(size, size, out);
}

const targets = [
  ['icon-192.png', 192, 0.9, false], ['icon-512.png', 512, 0.9, false], ['maskable-512.png', 512, 0.62, false], ['apple-touch-icon.png', 180, 0.88, false],
  ['admin-192.png', 192, 0.9, true], ['admin-512.png', 512, 0.9, true], ['admin-maskable-512.png', 512, 0.62, true], ['admin-apple-touch-icon.png', 180, 0.88, true],
];
for (const [name, size, safe, badge] of targets) { writeFileSync(new URL(`../public/icons/${name}`, import.meta.url), render(size, safe, badge)); console.log('✓', name); }
