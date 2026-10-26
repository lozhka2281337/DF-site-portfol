/* ============================================================
 *  MAIN.JS  —  сборка, загрузка контента, игровой цикл
 * ============================================================ */
(() => {
'use strict';

const C = DF.CONTENT;

/* ── Верхняя панель ── */
function buildTopbar() {
  document.getElementById('topbar-title').textContent    = C.topbar.title;
  document.getElementById('topbar-subtitle').textContent = C.topbar.subtitle;
  document.getElementById('topbar-date').textContent     = C.topbar.date;

  const statsEl = document.getElementById('topbar-stats');
  let html = '';
  for (const key in C.topbar.stats) {
    const s = C.topbar.stats[key];
    const lbl = s.label ? `<span class="lbl">${s.label}</span> ` : '';
    html += `<span>${lbl}<span style="color:${s.color}">${s.value}</span></span>`;
  }
  statsEl.innerHTML = html;
}

/* ── Левая панель ── */
function buildPanel() {
  const panel = document.getElementById('left-panel');
  let html = '';

  // Владелец
  html += `<div class="panel-section"><div class="section-title">${C.owner.title}</div>`;
  for (const row of C.owner.rows) {
    const style = row.color ? ` style="color:${row.color}"` : '';
    html += `<div class="row"><span class="key">${row.key}</span><span class="val"${style}>${row.value}</span></div>`;
  }
  html += `</div>`;

  // Управление
  html += `<div class="panel-section"><div class="section-title">${C.controls.title}</div>`;
  for (const line of C.controls.lines) html += `<div>${line}</div>`;
  html += `</div>`;

  // Осмотр (динамический)
  html += `<div class="panel-section"><div class="section-title">${C.welcome.title}</div>`;
  html += `<div id="info">
             <div class="title">${C.welcome.infoTitle}</div>
             <div class="desc">${C.welcome.infoDesc}</div>
           </div></div>`;

  // Легенда
  html += `<div class="panel-section"><div class="section-title">${C.legend.title}</div>`;
  for (const item of C.legend.items) {
    html += `<div class="legend-item"><span class="ch" style="color:${item.fg}">${item.ch}</span><span>${item.label}</span></div>`;
  }
  html += `</div>`;

  panel.innerHTML = html;
}

/* ── Заселение из content.js ── */
function spawnFromContent() {
  DF.player = { ...C.player, bold: true };
  DF.entities = [DF.player];
  for (const n of C.npcs) DF.entities.push({ ...n });
}

function placeObjects() {
  DF.objects.clear();
  for (const o of C.objects) DF.objects.set(o.x + ',' + o.y, { ...o });
}

/* ── Инициализация мира ── */
function buildWorld() {
  DF.generateTerrain();
  DF.carveFortress();
  DF.decorateStone();
}

/* ── Вода: мигает глубиной ── */
function startWaterAnimation() {
  setInterval(() => {
    let changed = false;
    for (let i = 0; i < 150; i++) {
      const x = Math.floor(Math.random() * DF.MAP_W);
      const y = Math.floor(Math.random() * DF.MAP_H);
      const t = DF.map[y][x];
      if (!t.depth) continue;
      t.ch = (t.ch === '~') ? String(t.depth) : '~';
      changed = true;
    }
    if (changed) DF.renderer.markDirty();
  }, 450);
}

/* ── NPC: случайное блуждание ── */
function startNpcWander() {
  const homes = C.npcs.map(n => ({ x: n.x, y: n.y }));
  setInterval(() => {
    let moved = false;
    for (let i = 0; i < C.npcs.length; i++) {
      const n = DF.entities[i + 1];  // [0] = player
      if (!n || Math.random() > 0.5) continue;
      const home = homes[i];
      const dx = [-1, 0, 1][Math.floor(Math.random() * 3)];
      const dy = [-1, 0, 1][Math.floor(Math.random() * 3)];
      if (!dx && !dy) continue;
      const nx = n.x + dx, ny = n.y + dy;
      if (Math.abs(nx - home.x) > 4 || Math.abs(ny - home.y) > 4) continue;
      if (!DF.canWalk(nx, ny)) continue;
      n.x = nx; n.y = ny;
      moved = true;
    }
    if (moved) DF.renderer.markDirty();
  }, 700);
}

/* ── Игровой цикл ── */
let frames = 0, lastFpsTime = performance.now();
function loop(now) {
  DF.input.handleHeldMovement(now);
  if (DF.renderer.dirty) {
    DF.renderer.render();
    DF.renderer.dirty = false;
    frames++;
  }
  if (now - lastFpsTime > 1000) {
    document.getElementById('fps').textContent =
      frames * Math.round(1000 / (now - lastFpsTime));
    frames = 0;
    lastFpsTime = now;
  }
  requestAnimationFrame(loop);
}

/* ── Boot ── */
buildTopbar();
buildPanel();
buildWorld();
spawnFromContent();
placeObjects();
DF.renderer.init();
DF.input.init();
DF.renderer.showInfo(DF.player.x, DF.player.y);
startWaterAnimation();
startNpcWander();
requestAnimationFrame(t => { lastFpsTime = t; loop(t); });

})();
