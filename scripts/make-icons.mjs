// Малює іконки застосунку (золотий хрест на бордовому фоні) без зовнішніх бібліотек: node scripts/make-icons.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const body = Buffer.concat([Buffer.from(type), data]); const sum = Buffer.alloc(4); sum.writeUInt32BE(crc(body)); return Buffer.concat([len, body, sum]); };
const png = (w, h, rgb) => {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
};

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const WINE = [90, 20, 24], DEEP = [27, 6, 7];
const GOLD_TOP = [246, 227, 168], GOLD_MID = [212, 173, 92], GOLD_LOW = [155, 116, 48];

/** size — розмір у пікселях; safe — частка, у яку вписано малюнок (менша для maskable) */
function render(size, safe) {
  const SS = 3, N = size * SS;
  const px = new Float32Array(N * N * 3);
  const s = size * safe * SS, o = (N - s) / 2, cx = N / 2;
  const seg = (x, y, x1, y1, x2, y2) => { const dx = x2 - x1, dy = y2 - y1; const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy))); return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy)); };
  const lw = N * 0.02; // половина товщини лінії
  const lines = [
    [cx, o + s * 0.2, cx, o + s * 0.8],
    [cx - s * 0.2, o + s * 0.36, cx + s * 0.2, o + s * 0.36],
    [cx - s * 0.13, o + s * 0.66, cx + s * 0.13, o + s * 0.58],
  ];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let c = mix(WINE, DEEP, (x + y) / (2 * N));
    const glow = Math.max(0, 1 - Math.hypot(x - N * 0.5, y - N * 0.35) / (N * 0.6));
    c = mix(c, [198, 160, 82], glow * glow * 0.28);
    const ring = Math.abs(Math.hypot(x - cx, y - N / 2) - s * 0.5);
    if (ring < N * 0.006) c = mix(c, [232, 207, 141], 0.55);
    const d = Math.min(...lines.map((l) => seg(x, y, ...l)));
    if (d < lw) {
      const t = (y - (o + s * 0.2)) / (s * 0.6);
      const g = t < 0.5 ? mix(GOLD_TOP, GOLD_MID, Math.max(0, t) * 2) : mix(GOLD_MID, GOLD_LOW, Math.min(1, (t - 0.5) * 2));
      c = g;
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

const targets = [['icon-192.png', 192, 0.78], ['icon-512.png', 512, 0.78], ['maskable-512.png', 512, 0.56], ['apple-touch-icon.png', 180, 0.7]];
for (const [name, size, safe] of targets) { writeFileSync(new URL(`../public/icons/${name}`, import.meta.url), render(size, safe)); console.log('✓', name); }
