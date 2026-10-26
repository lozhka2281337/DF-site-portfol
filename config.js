/* ============================================================
 *  CONFIG.JS  —  константы и визуал тайлов
 *  Текст (name/desc) смотри в content.js → DF.TILE_TEXT
 * ============================================================ */
window.DF = window.DF || {};

/* ── Размер мира и клетки ── */
DF.MAP_W = 200;
DF.MAP_H = 120;
DF.FONT_SIZE = 18;
DF.CELL_W = 13;
DF.CELL_H = 22;
DF.MOVE_COOLDOWN_MS = 80;

/* ── Глобальное состояние ── */
DF.map = [];               // сетка тайлов
DF.objects = new Map();    // 'x,y' → объект
DF.entities = [];          // игрок + NPC
DF.player = null;

/* ── Тайлы: ch/fg/bg — визуал, walkable — физика,
 *    grass — участвует в декорации, textKey — общий текст ── */
DF.TILES = {
  /* вода */
  water:     { ch:'~', fg:'#2255ee', bg:'#000a1a', walkable:false },
  shallow:   { ch:'~', fg:'#44aaff', bg:'#000a1a', walkable:false },
  bank:      { ch:'▼', fg:'#c8b48c', bg:'#000000', walkable:true  },

  /* трава (5 оттенков) */
  grass0:    { ch:',', fg:'#005500', bg:'#000000', walkable:true, grass:true, textKey:'grass' },
  grass1:    { ch:"'", fg:'#007722', bg:'#000000', walkable:true, textKey:'grass' },
  grass2:    { ch:'`', fg:'#009944', bg:'#000000', walkable:true, textKey:'grass' },
  grass3:    { ch:'.', fg:'#00bb55', bg:'#000000', walkable:true, textKey:'grass' },
  grass4:    { ch:'"', fg:'#00dd66', bg:'#000000', walkable:true, textKey:'grass' },

  /* деревья и кусты — все тексты через textKey */
  tree:      { ch:'▲', fg:'#00ff22', bg:'#000000', walkable:true, textKey:'tree' },
  tree2:     { ch:'▲', fg:'#22dd22', bg:'#000000', walkable:true, textKey:'tree' },
  tree3:     { ch:'▲', fg:'#44ff44', bg:'#000000', walkable:true, textKey:'tree' },
  bush:      { ch:'○', fg:'#00aa22', bg:'#000000', walkable:true },
  shrub:     { ch:'º', fg:'#88dd00', bg:'#000000', walkable:true },
  flower:    { ch:'*', fg:'#ffff00', bg:'#000000', walkable:true },
  flower2:   { ch:'*', fg:'#ff44aa', bg:'#000000', walkable:true },

  /* камень */
  wall:      { ch:'▓', fg:'#555555', bg:'#000000', walkable:false },
  limestone: { ch:'▓', fg:'#777766', bg:'#000000', walkable:false },
  obsidian:  { ch:'▓', fg:'#332255', bg:'#000000', walkable:false },
  cracked:   { ch:'▒', fg:'#444444', bg:'#000000', walkable:false },
  built:     { ch:'#', fg:'#888888', bg:'#000000', walkable:false },
  pillar:    { ch:'I', fg:'#888888', bg:'#000000', walkable:false },

  /* интерьер */
  floor:     { ch:'.', fg:'#555555', bg:'#000000', walkable:true  },
  dirt:      { ch:',', fg:'#996644', bg:'#000000', walkable:true  },
  stairs:    { ch:'X', fg:'#cccccc', bg:'#000000', walkable:true  },
};

/* ── Хелпер: собрать тайл с текстом из content.js ── */
DF.makeTile = function (id, extra) {
  const base = DF.TILES[id];
  if (!base) throw new Error('Unknown tile id: ' + id);
  const txtKey = base.textKey || id;
  const txt = (DF.TILE_TEXT && DF.TILE_TEXT[txtKey]) || {};
  return Object.assign({}, base, txt, extra || {});
};
