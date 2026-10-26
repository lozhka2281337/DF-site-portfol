/* ============================================================
 *  WORLD.JS  —  шум, рельеф, крепость
 * ============================================================ */
window.DF = window.DF || {};

/* ── Шум (детерминированный) ── */
DF.hash2 = function (x, y, s) {
  s = s || 0;
  let h = (x * 374761393 + y * 668265263 + s * 144269) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};

DF.noise = function (x, y, scale, seed) {
  seed = seed || 0;
  const sx = x / scale, sy = y / scale;
  const x0 = Math.floor(sx), y0 = Math.floor(sy);
  const fx = sx - x0, fy = sy - y0;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = DF.hash2(x0,     y0,     seed);
  const b = DF.hash2(x0 + 1, y0,     seed);
  const c = DF.hash2(x0,     y0 + 1, seed);
  const d = DF.hash2(x0 + 1, y0 + 1, seed);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
};

/* ── Проходимость клетки ── */
DF.canWalk = function (x, y) {
  if (x < 0 || y < 0 || x >= DF.MAP_W || y >= DF.MAP_H) return false;
  return DF.map[y][x].walkable;
};

/* ============================================================
 *  ГЕНЕРАЦИЯ РЕЛЬЕФА
 * ============================================================ */
DF.generateTerrain = function () {
  DF.map = [];
  const W = DF.MAP_W, H = DF.MAP_H;
  const MT = DF.makeTile;

  // 1) Базовая трава
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) row.push(MT('grass0'));
    DF.map.push(row);
  }

  // 2) Река с тановыми берегами
  for (let y = 0; y < H; y++) {
    const base = 14 + Math.sin(y * 0.08) * 5;
    const wobble = (DF.noise(y * 0.1, 0, 1, 7) - 0.5) * 8;
    const center = base + wobble;
    for (let x = 0; x < W; x++) {
      const d = Math.abs(x - center);
      if (d < 3.0) {
        DF.map[y][x] = MT('water', {
          depth: Math.max(1, Math.min(7, Math.round(7 - d))),
        });
      } else if (d < 4.0) {
        DF.map[y][x] = MT('shallow');
      } else if (d < 5.2) {
        DF.map[y][x] = MT('bank');
      }
    }
  }

  // 3) Гора с неровным краем
  for (let y = 0; y < H; y++) {
    const edge = 62 + Math.sin(y * 0.04) * 6 +
                 (DF.noise(y * 0.15, 0, 1, 11) - 0.5) * 12;
    for (let x = 0; x < W; x++) {
      if (x > edge) {
        const n = DF.noise(x * 0.1, y * 0.1, 1, 21);
        let id = 'wall';
        if (n > 0.62) id = 'limestone';
        else if (n < 0.28) id = 'obsidian';
        DF.map[y][x] = MT(id);
      }
    }
  }

  // 4) Земляная тропа к крепости
  for (let x = 40; x < 63; x++) {
    for (let y = 54; y <= 57; y++) {
      if (DF.map[y][x].grass) DF.map[y][x] = MT('dirt');
    }
  }

  // 5) Декорации — кластеризованные рощи
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!DF.map[y][x].grass) continue;

      const forestN = DF.noise(x * 0.07, y * 0.07, 1, 42);
      const r = DF.hash2(x, y, 33);

      if (forestN > 0.58) {
        // густой лес
        if      (r < 0.60) DF.map[y][x] = MT('tree');
        else if (r < 0.75) DF.map[y][x] = MT('tree2');
        else if (r < 0.85) DF.map[y][x] = MT('tree3');
        else if (r < 0.92) DF.map[y][x] = MT('bush');
        else if (r < 0.97) DF.map[y][x] = MT('shrub');
        else                DF.map[y][x] = MT('grass3');
      } else if (forestN > 0.45) {
        // опушка
        if      (r < 0.10) DF.map[y][x] = MT('tree');
        else if (r < 0.18) DF.map[y][x] = MT('bush');
        else if (r < 0.24) DF.map[y][x] = MT('shrub');
        else if (r < 0.32) DF.map[y][x] = MT('flower');
        else if (r < 0.36) DF.map[y][x] = MT('flower2');
        else if (r < 0.55) DF.map[y][x] = MT('grass4');
        else if (r < 0.75) DF.map[y][x] = MT('grass3');
        else if (r < 0.90) DF.map[y][x] = MT('grass2');
        else                DF.map[y][x] = MT('grass1');
      } else {
        // открытая трава
        if      (r < 0.03) DF.map[y][x] = MT('flower');
        else if (r < 0.05) DF.map[y][x] = MT('shrub');
        else if (r < 0.07) DF.map[y][x] = MT('bush');
        else if (r < 0.25) DF.map[y][x] = MT('grass4');
        else if (r < 0.50) DF.map[y][x] = MT('grass3');
        else if (r < 0.70) DF.map[y][x] = MT('grass2');
        else if (r < 0.85) DF.map[y][x] = MT('grass1');
        else                DF.map[y][x] = MT('grass0');
      }
    }
  }
};

/* ============================================================
 *  КРЕПОСТЬ
 * ============================================================ */
function digRect(x1, y1, x2, y2) {
  for (let y = y1; y <= y2; y++)
    for (let x = x1; x <= x2; x++)
      if (y >= 0 && y < DF.MAP_H && x >= 0 && x < DF.MAP_W)
        DF.map[y][x] = DF.makeTile('floor');
}
function digH(x1, x2, y, w) {
  w = w || 2;
  for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++)
    for (let dy = 0; dy < w; dy++) {
      const yy = y + dy;
      if (yy >= 0 && yy < DF.MAP_H) DF.map[yy][x] = DF.makeTile('floor');
    }
}
function digV(y1, y2, x, w) {
  w = w || 2;
  for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++)
    for (let dx = 0; dx < w; dx++) {
      const xx = x + dx;
      if (xx >= 0 && xx < DF.MAP_W) DF.map[y][xx] = DF.makeTile('floor');
    }
}

DF.carveFortress = function () {
  digH(55, 75, 55, 2);
  digRect(75, 42, 115, 70);
  for (const [px, py] of [[85,50],[105,50],[85,60],[105,60]])
    DF.map[py][px] = DF.makeTile('pillar');
  digRect(60, 30, 72, 50);    digH(72, 75, 40, 2);   // кузница
  digRect(60, 60, 72, 80);    digH(72, 75, 68, 2);   // сокровищница
  digRect(80, 75, 100, 92);   digV(70, 75, 90, 2);   // библиотека
  digRect(120, 30, 140, 50);  digH(115, 120, 45, 2); // тронный зал
  digRect(150, 40, 180, 70);  digH(115, 150, 65, 2); // депо
  DF.map[70][85] = DF.makeTile('stairs');
  DF.map[70][86] = DF.makeTile('stairs');
};

DF.decorateStone = function () {
  for (let y = 0; y < DF.MAP_H; y++) {
    for (let x = 0; x < DF.MAP_W; x++) {
      const t = DF.map[y][x];
      if (t.walkable) continue;
      let nearFloor = false;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < DF.MAP_W && ny < DF.MAP_H &&
            DF.map[ny][nx].walkable) { nearFloor = true; break; }
      }
      if (nearFloor && t.name === 'Stone' && DF.hash2(x, y, 60) > 0.82)
        DF.map[y][x] = DF.makeTile('cracked');
    }
  }
};
