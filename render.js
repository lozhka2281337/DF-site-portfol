/* ============================================================
 *  RENDER.JS  —  canvas, камера, рендер, инфо-панель
 * ============================================================ */
window.DF = window.DF || {};

DF.renderer = {
  canvas: null,
  ctx: null,
  cols: 0,
  rows: 0,
  camX: 0,
  camY: 0,
  hoverTile: null,
  dirty: true,

  init() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    window.addEventListener('resize', () => this.resize());
    this.resize();
  },

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width  = Math.max(1, Math.floor(rect.width));
    this.canvas.height = Math.max(1, Math.floor(rect.height));
    this.cols = Math.ceil(this.canvas.width  / DF.CELL_W);
    this.rows = Math.ceil(this.canvas.height / DF.CELL_H);
    this.updateCamera();
    this.dirty = true;
  },

  updateCamera() {
    const halfW = Math.floor(this.cols / 2);
    const halfH = Math.floor(this.rows / 2);
    this.camX = DF.player.x - halfW;
    this.camY = DF.player.y - halfH;
    this.camX = Math.max(0, Math.min(Math.max(0, DF.MAP_W - this.cols), this.camX));
    this.camY = Math.max(0, Math.min(Math.max(0, DF.MAP_H - this.rows), this.camY));
  },

  markDirty() { this.dirty = true; },
  setHover(x, y) { this.hoverTile = { x, y }; this.dirty = true; },
  clearHover() { this.hoverTile = null; this.dirty = true; },

  tileAt(x, y) {
    const obj = DF.objects.get(x + ',' + y);
    if (obj) return obj;
    const ent = DF.entities.find(e => e.x === x && e.y === y);
    if (ent) return ent;
    return DF.map[y] && DF.map[y][x] ? DF.map[y][x] : null;
  },

  showInfo(x, y) {
    const infoEl = document.getElementById('info');
    if (!infoEl) return;
    const t = this.tileAt(x, y);
    if (!t) return;
    const title = t.name || 'Unknown';
    const desc  = (t.desc || '').replace(/\n/g, '<br>');
    const link  = t.link
      ? `<a href="${t.link}" target="_blank" rel="noopener">${t.linkText || t.link}</a>`
      : '';
    infoEl.innerHTML =
      `<div class="title">${title}</div>` +
      `<div class="desc">${desc}</div>` +
      (link ? `<div>${link}</div>` : '');
  },

  render() {
    const ctx = this.ctx;
    const W = this.canvas.width, H = this.canvas.height;
    const cw = DF.CELL_W, ch = DF.CELL_H;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    ctx.font = `${DF.FONT_SIZE}px 'Consolas','Courier New','Segoe UI Symbol',monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const camX = this.camX, camY = this.camY;
    const endX = Math.min(DF.MAP_W, camX + this.cols + 1);
    const endY = Math.min(DF.MAP_H, camY + this.rows + 1);

    for (let my = Math.max(0, camY); my < endY; my++) {
      for (let mx = Math.max(0, camX); mx < endX; mx++) {
        const tile = DF.map[my][mx];
        const px = (mx - camX) * cw;
        const py = (my - camY) * ch;

        if (tile.bg && tile.bg !== '#000000') {
          ctx.fillStyle = tile.bg;
          ctx.fillRect(px, py, cw, ch);
        }
        ctx.fillStyle = tile.fg;
        ctx.fillText(tile.ch, px + cw * 0.5, py + ch * 0.5);

        const obj = DF.objects.get(mx + ',' + my);
        if (obj) {
          if (obj.bg && obj.bg !== '#000000') {
            ctx.fillStyle = obj.bg;
            ctx.fillRect(px, py, cw, ch);
          }
          ctx.fillStyle = obj.fg;
          ctx.fillText(obj.ch, px + cw * 0.5, py + ch * 0.5);
        }
      }
    }

    // NPC
    for (const e of DF.entities) {
      if (e === DF.player) continue;
      const rx = e.x - camX, ry = e.y - camY;
      if (rx < -1 || ry < -1 || rx > this.cols + 1 || ry > this.rows + 1) continue;
      ctx.fillStyle = e.fg;
      ctx.fillText(e.ch, rx * cw + cw * 0.5, ry * ch + ch * 0.5);
    }

    // Игрок
    {
      const px = (DF.player.x - camX) * cw;
      const py = (DF.player.y - camY) * ch;
      ctx.fillStyle = 'rgba(0,255,255,0.10)';
      ctx.fillRect(px, py, cw, ch);
      ctx.font = `bold ${DF.FONT_SIZE}px 'Consolas','Courier New','Segoe UI Symbol',monospace`;
      ctx.fillStyle = DF.player.fg;
      ctx.fillText(DF.player.ch, px + cw * 0.5, py + ch * 0.5);
      ctx.font = `${DF.FONT_SIZE}px 'Consolas','Courier New','Segoe UI Symbol',monospace`;
    }

    // Подсветка hover
    if (this.hoverTile) {
      const rx = this.hoverTile.x - camX, ry = this.hoverTile.y - camY;
      if (rx >= 0 && ry >= 0 && rx < this.cols && ry < this.rows) {
        ctx.strokeStyle = 'rgba(255,255,0,0.6)';
        ctx.lineWidth = 1;
        ctx.strokeRect(rx * cw + 1.5, ry * ch + 1.5, cw - 3, ch - 3);
      }
    }
  },
};
