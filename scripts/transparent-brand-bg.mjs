/**
 * Removes solid/near-solid outer background by flood-filling from image edges.
 * Preserves interior “white” that is not connected to the border (e.g. holes).
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const brandDir = path.join(__dirname, '../src/assets/brand');
const publicDir = path.join(__dirname, '../public');

const FILES = ['stockalarm-logo2.png', 'stockalarm-logo.png'];

const COLOR_TOL = 18;

function sampleBg(buf, w, h) {
  const samples = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
  ];
  let r = 0,
    g = 0,
    b = 0;
  for (const [x, y] of samples) {
    const i = (y * w + x) * 4;
    r += buf[i];
    g += buf[i + 1];
    b += buf[i + 2];
  }
  return { r: r / 4, g: g / 4, b: b / 4 };
}

function matchesBg(r, g, b, bg) {
  return (
    Math.abs(r - bg.r) <= COLOR_TOL &&
    Math.abs(g - bg.g) <= COLOR_TOL &&
    Math.abs(b - bg.b) <= COLOR_TOL
  );
}

async function processFile(relName) {
  const inputPath = path.join(brandDir, relName);
  if (!fs.existsSync(inputPath)) {
    console.warn('skip (missing):', inputPath);
    return;
  }

  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const buf = Buffer.from(data);
  const w = info.width;
  const h = info.height;
  const bg = sampleBg(buf, w, h);

  const visited = new Uint8Array(w * h);
  const queue = [];

  const trySeed = (x, y) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const idx = y * w + x;
    if (visited[idx]) return;
    const i = idx * 4;
    const r = buf[i],
      g = buf[i + 1],
      b = buf[i + 2];
    if (!matchesBg(r, g, b, bg)) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < w; x++) {
    trySeed(x, 0);
    trySeed(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    trySeed(0, y);
    trySeed(w - 1, y);
  }

  while (queue.length) {
    const idx = queue.pop();
    const x = idx % w;
    const y = (idx - x) / w;
    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const nidx = ny * w + nx;
      if (visited[nidx]) continue;
      const i = nidx * 4;
      const r = buf[i],
        g = buf[i + 1],
        b = buf[i + 2];
      if (!matchesBg(r, g, b, bg)) continue;
      visited[nidx] = 1;
      queue.push(nidx);
    }
  }

  for (let idx = 0; idx < visited.length; idx++) {
    if (!visited[idx]) continue;
    const i = idx * 4;
    buf[i + 3] = 0;
  }

  const outPath = inputPath;
  await sharp(buf, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(outPath + '.tmp');
  fs.renameSync(outPath + '.tmp', outPath);
  console.log('OK', relName, `${w}x${h}`);
}

async function main() {
  for (const f of FILES) {
    await processFile(f);
  }
  const fav = path.join(publicDir, 'favicon.png');
  const logo2 = path.join(brandDir, 'stockalarm-logo2.png');
  if (fs.existsSync(logo2) && fs.existsSync(fav)) {
    fs.copyFileSync(logo2, fav);
    console.log('OK public/favicon.png <- stockalarm-logo2.png');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
