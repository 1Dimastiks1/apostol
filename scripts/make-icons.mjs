// Малює іконки застосунку (бордовий фон, золота арка з хрестом) без зовнішніх бібліотек: node scripts/make-icons.mjs
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
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const WINE = [112, 24, 32], DEEP = [30, 6, 9];
const G1 = [250, 232, 176], G2 = [214, 175, 94], G3 = [150, 110, 44];
const goldAt = (t) => (t < 0.5 ? mix(G1, G2, clamp(t) * 2) : mix(G2, G3, clamp((t - 0.5) * 2)));

/** frame — тонка золота рамка по краю (для maskable її немає); safe — частка, у яку вписано головний малюнок */
function render(size, safe, frame) {
  const SS = 3, N = size * SS;
  const px = new Float32Array(N * N * 3);
  const s = N * safe, o = (N - s) / 2;
  const X = (u) => o + u * s, Y = (v) => o + v * s;
  const seg = (x, y, x1, y1, x2, y2) => { const dx = x2 - x1, dy = y2 - y1; const t = clamp(((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)); return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy)); };
  const cx = N / 2;
  // купол-цибулина з хрестом: коло + конус до вершини
  const R = s * 0.225, domeC = Y(0.66), tipY = Y(0.40), d = domeC - tipY;
  const alpha = Math.asin(R / d), tanA = Math.tan(alpha), tangY = tipY + d * Math.cos(alpha) ** 2;
  const inDome = (x, y) => Math.hypot(x - cx, y - domeC) < R || (y >= tipY && y <= tangY && Math.abs(x - cx) <= (y - tipY) * tanA);
  const drum = [cx - s * 0.12, domeC + R * 0.82, cx + s * 0.12, domeC + R * 0.82 + s * 0.07];
  const inDrum = (x, y) => x >= drum[0] && x <= drum[2] && y >= drum[1] && y <= drum[3];
  const crossT = N * 0.0155, thin = N * 0.0045;
  const cross = [
    [cx, Y(0.1), cx, Y(0.405)],
    [cx - s * 0.085, Y(0.185), cx + s * 0.085, Y(0.185)],
    [cx - s * 0.055, Y(0.335), cx + s * 0.055, Y(0.29)],
  ];
  const baseLine = [cx - s * 0.3, drum[3] + s * 0.03, cx + s * 0.3, drum[3] + s * 0.03];
  const ringR = s * 0.5;
  const fr = N * 0.07, frR = N * 0.16;
  const frameSd = (x, y) => { const qx = Math.abs(x - N / 2) - (N / 2 - fr - frR), qy = Math.abs(y - N / 2) - (N / 2 - fr - frR); return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - frR; };

  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let c = mix(WINE, DEEP, clamp((x * 0.45 + y) / (N * 1.35)));
    const glow = Math.max(0, 1 - Math.hypot(x - cx, y - Y(0.42)) / (s * 0.62));
    c = mix(c, [214, 160, 90], glow * glow * 0.32);
    if (frame && Math.abs(frameSd(x, y)) < thin) c = mix(c, goldAt(y / N), 0.55);
    if (Math.abs(Math.hypot(x - cx, y - Y(0.5)) - ringR) < thin) c = mix(c, goldAt(y / N), 0.5);
    if (inDome(x, y)) {
      // золото з м'яким світлом зліва зверху
      const lit = clamp(1 - Math.hypot(x - (cx - R * 0.45), y - (domeC - R * 0.5)) / (R * 1.5));
      c = mix(goldAt((y - tipY) / (R * 2.3)), [255, 244, 205], lit * 0.35);
    } else if (inDrum(x, y)) c = goldAt(0.78);
    if (seg(x, y, ...baseLine) < thin * 1.7) c = mix(c, goldAt(0.7), 0.9);
    if (Math.min(...cross.map((l) => seg(x, y, ...l))) < crossT) c = goldAt((y - Y(0.1)) / (s * 0.3));
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

const targets = [['icon-192.png', 192, 0.84, false], ['icon-512.png', 512, 0.84, false], ['maskable-512.png', 512, 0.6, false], ['apple-touch-icon.png', 180, 0.78, false]];
for (const [name, size, safe, frame] of targets) { writeFileSync(new URL(`../public/icons/${name}`, import.meta.url), render(size, safe, frame)); console.log('✓', name); }
