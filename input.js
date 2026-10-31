/* ============================================================
 *  INPUT.JS  —  клавиатура, мышь, панель
 * ============================================================ */
window.DF = window.DF || {};

DF.input = {
  keys: {},
  lastMoveTime: -1000,
  MOVE_KEYS: new Set(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d']),

  init() {
    document.addEventListener('keydown', e => this.onKeyDown(e));
    document.addEventListener('keyup',   e => this.onKeyUp(e));
    window.addEventListener('blur',      () => { for (const k in this.keys) this.keys[k] = false; });

    const canvas = DF.renderer.canvas;
    canvas.addEventListener('mousemove', e => this.onMouseMove(e));
    canvas.addEventListener('mouseleave', () => this.onMouseLeave());
    canvas.addEventListener('click',     e => this.onClick(e));

    const toggle = document.getElementById('panel-toggle');
    toggle.addEventListener('click', () => this.togglePanel());
  },

  onKeyDown(e) {
    const k = e.key.toLowerCase();
    if (k === 'tab') { e.preventDefault(); this.togglePanel(); return; }

    if (this.MOVE_KEYS.has(k)) {
      e.preventDefault();
      if (!this.keys[k]) this.lastMoveTime = -1000;   // мгновенный первый шаг
      this.keys[k] = true;
    }

    if (k === 'r') {
      DF.renderer.updateCamera();
      DF.renderer.showInfo(DF.player.x, DF.player.y);
      DF.renderer.markDirty();
    }
  },

  onKeyUp(e) {
    const k = e.key.toLowerCase();
    if (this.MOVE_KEYS.has(k)) this.keys[k] = false;
  },

  onMouseMove(e) {
    const r = DF.renderer.canvas.getBoundingClientRect();
    const mx = Math.floor((e.clientX - r.left) / DF.CELL_W) + DF.renderer.camX;
    const my = Math.floor((e.clientY - r.top)  / DF.CELL_H) + DF.renderer.camY;
    document.getElementById('cursor').textContent = `[X: ${mx} Y: ${my}]`;
    if (mx < 0 || my < 0 || mx >= DF.MAP_W || my >= DF.MAP_H) return;
    const h = DF.renderer.hoverTile;
    if (!h || h.x !== mx || h.y !== my) {
      DF.renderer.setHover(mx, my);
      DF.renderer.showInfo(mx, my);
    }
  },

  onMouseLeave() {
    DF.renderer.clearHover();
    DF.renderer.showInfo(DF.player.x, DF.player.y);
  },

  onClick(e) {
    const r = DF.renderer.canvas.getBoundingClientRect();
    const mx = Math.floor((e.clientX - r.left) / DF.CELL_W) + DF.renderer.camX;
    const my = Math.floor((e.clientY - r.top)  / DF.CELL_H) + DF.renderer.camY;
    if (mx >= 0 && my >= 0 && mx < DF.MAP_W && my < DF.MAP_H)
      DF.renderer.showInfo(mx, my);
  },

  togglePanel() {
    const panel = document.getElementById('left-panel');
    const btn = document.getElementById('panel-toggle');
    const collapsed = panel.classList.toggle('collapsed');
    btn.classList.toggle('collapsed', collapsed);
    btn.textContent = collapsed ? '▶' : '◀';
  },

  tryMove(dx, dy) {
    const nx = DF.player.x + dx;
    const ny = DF.player.y + dy;
    if (!DF.canWalk(nx, ny)) return;
    DF.player.x = nx;
    DF.player.y = ny;
    DF.renderer.updateCamera();
    if (!DF.renderer.hoverTile) DF.renderer.showInfo(nx, ny);
    DF.renderer.markDirty();
  },

  handleHeldMovement(now) {
    if (now - this.lastMoveTime < DF.MOVE_COOLDOWN_MS) return;
    let dx = 0, dy = 0;
    if      (this.keys['arrowup']    || this.keys['w']) dy = -1;
    else if (this.keys['arrowdown']  || this.keys['s']) dy =  1;
    else if (this.keys['arrowleft']  || this.keys['a']) dx = -1;
    else if (this.keys['arrowright'] || this.keys['d']) dx =  1;
    if (dx === 0 && dy === 0) return;
    this.tryMove(dx, dy);
    this.lastMoveTime = now;
  },
};
