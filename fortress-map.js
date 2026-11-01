(() => {
  'use strict';

  const WIDTH = 80;
  const HEIGHT = 80;
  const TILE = Object.freeze({ EMPTY: 0, WALL: 1, FLOOR: 2, STAIRS: 3 });
  const map = document.getElementById('fortress-map');
  const eventLog = document.getElementById('fortress-event-log');
  const inspectButton = document.getElementById('fortress-inspect');
  const regenerateButton = document.getElementById('fortress-regenerate');
  const zoomOutButton = document.getElementById('fortress-zoom-out');
  const zoomInButton = document.getElementById('fortress-zoom-in');
  const zoomResetButton = document.getElementById('fortress-zoom-reset');
  const zoomValue = document.getElementById('fortress-zoom-value');
  if (!map || !eventLog) return;

  const roomSpecs = [
    { id: 'grand-hall', title: '👑 Grand Hall', subtitle: 'Central gathering room', symbol: '♛', className: 'gold' },
    { id: 'barracks', title: '⚔ Barracks / Forge', subtitle: 'Defense and workshops', symbol: '⚔', className: 'cyan' },
    { id: 'treasury', title: '💎 Treasury', subtitle: 'Storage and stockpiles', symbol: '◆', className: 'violet' },
    { id: 'tavern', title: '🍺 Tavern', subtitle: 'Rest and social hall', symbol: '♟', className: 'green' },
    { id: 'workshop', title: '⚒ Workshop', subtitle: 'Tools and materials', symbol: '⚒', className: 'amber' },
    { id: 'dormitory', title: '⌂ Dormitory', subtitle: 'Dwarven quarters', symbol: '⌂', className: 'amber' },
    { id: 'stockpile', title: '▦ Stockpile', subtitle: 'Organized reserves', symbol: '▦', className: 'amber' },
    { id: 'guard-post', title: '◈ Guard Post', subtitle: 'Fortress watch', symbol: '◈', className: 'amber' }
  ];
  const state = { level: null, inspect: false, events: [], zoom: 1 };
  const key = (x, y) => `${x}:${y}`;
  const randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  const inBounds = (x, y) => x >= 0 && y >= 0 && x < WIDTH && y < HEIGHT;

  function addEvent(message) {
    state.events.push(message);
    state.events = state.events.slice(-6);
    eventLog.innerHTML = state.events.map(event => `<li>${event}</li>`).join('');
  }

  function createGrid() {
    return Array.from({ length: HEIGHT }, () => new Uint8Array(WIDTH).fill(TILE.WALL));
  }

  function carve(level, x, y, tile = TILE.FLOOR) {
    if (inBounds(x, y) && level.tiles[y][x] !== TILE.STAIRS) level.tiles[y][x] = tile;
  }

  function carveRoom(level, room) {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) carve(level, x, y);
    }
    room.center = { x: room.x + Math.floor(room.width / 2), y: room.y + Math.floor(room.height / 2) };
  }

  function splitBsp(region, depth, leaves, splitVertical = region.width >= region.height) {
    const canSplitVertically = region.width >= 24;
    const canSplitHorizontally = region.height >= 24;
    if (depth <= 0 || (!canSplitVertically && !canSplitHorizontally)) {
      leaves.push(region);
      return;
    }
    if (splitVertical && canSplitVertically) {
      const split = randomBetween(Math.floor(region.width * 0.44), Math.floor(region.width * 0.56));
      splitBsp({ x: region.x, y: region.y, width: split, height: region.height }, depth - 1, leaves, false);
      splitBsp({ x: region.x + split, y: region.y, width: region.width - split, height: region.height }, depth - 1, leaves, false);
    } else {
      const split = randomBetween(Math.floor(region.height * 0.44), Math.floor(region.height * 0.56));
      splitBsp({ x: region.x, y: region.y, width: region.width, height: split }, depth - 1, leaves, true);
      splitBsp({ x: region.x, y: region.y + split, width: region.width, height: region.height - split }, depth - 1, leaves, true);
    }
  }

  function roomFromLeaf(spec, leaf) {
    const width = randomBetween(12, Math.min(20, leaf.width - 6));
    const height = randomBetween(10, Math.min(17, leaf.height - 6));
    return {
      ...spec,
      x: randomBetween(leaf.x + 2, leaf.x + Math.max(2, leaf.width - width - 2)),
      y: randomBetween(leaf.y + 2, leaf.y + Math.max(2, leaf.height - height - 2)),
      width,
      height
    };
  }

  function carveCorridor(level, from, to, width = 2) {
    const points = Math.random() > 0.5
      ? [[from.x, from.y], [to.x, from.y], [to.x, to.y]]
      : [[from.x, from.y], [from.x, to.y], [to.x, to.y]];
    for (let i = 0; i < points.length - 1; i++) {
      let [x, y] = points[i];
      const [endX, endY] = points[i + 1];
      while (true) {
        for (let offset = 0; offset < width; offset++) {
          carve(level, x + offset, y);
          carve(level, x, y + offset);
        }
        if (x === endX && y === endY) break;
        if (x !== endX) x += Math.sign(endX - x);
        if (y !== endY) y += Math.sign(endY - y);
      }
    }
  }

  function carveMainHall(level) {
    const center = { x: Math.floor(WIDTH / 2), y: Math.floor(HEIGHT / 2) };
    level.stair = center;
    level.tiles[center.y][center.x] = TILE.STAIRS;
    return center;
  }

  function carveMiningShafts(level, anchor, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.18;
      const length = randomBetween(8, 18);
      let x = anchor.x;
      let y = anchor.y;
      for (let step = 0; step < length; step++) {
        x += Math.round(Math.cos(angle));
        y += Math.round(Math.sin(angle));
        if (!inBounds(x, y) || x < 2 || y < 2 || x > WIDTH - 3 || y > HEIGHT - 3) break;
        carve(level, x, y);
      }
    }
  }

  function cellularAutomata(level) {
    const next = level.tiles.map(row => Uint8Array.from(row));
    for (let y = 1; y < HEIGHT - 1; y++) {
      for (let x = 1; x < WIDTH - 1; x++) {
        if (level.tiles[y][x] !== TILE.WALL) continue;
        let floors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx || dy) floors += level.tiles[y + dy][x + dx] !== TILE.WALL ? 1 : 0;
          }
        }
        if (floors >= 5 && Math.random() > 0.25) next[y][x] = TILE.FLOOR;
      }
    }
    level.tiles = next;
  }

  function rebuildWalkable(level) {
    level.walkable = new Set();
    level.roomAt = new Map();
    level.rooms.forEach(room => {
      for (let y = room.y; y < room.y + room.height; y++) {
        for (let x = room.x; x < room.x + room.width; x++) level.roomAt.set(key(x, y), room);
      }
    });
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        if (level.tiles[y][x] !== TILE.WALL) level.walkable.add(key(x, y));
      }
    }
  }

  function generateFortress() {
    const level = { tiles: createGrid(), rooms: [], roomAt: new Map(), walkable: new Set(), dwarves: [] };
    const leaves = [];
    splitBsp({ x: 2, y: 2, width: WIDTH - 4, height: HEIGHT - 4 }, 3, leaves);
    const mainHall = carveMainHall(level);
    const roomCount = randomBetween(5, 8);
    const shuffledLeaves = leaves.sort(() => Math.random() - 0.5);
    roomSpecs.slice(0, roomCount).forEach((spec, index) => {
      const room = roomFromLeaf(spec, shuffledLeaves[index]);
      level.rooms.push(room);
      carveRoom(level, room);
      carveCorridor(level, mainHall, room.center, 2);
    });
    level.rooms.forEach((room, index) => {
      carveMiningShafts(level, room.center, 2 + (index % 2));
    });
    carveMiningShafts(level, mainHall, 6);
    cellularAutomata(level);
    level.tiles[mainHall.y][mainHall.x] = TILE.STAIRS;
    rebuildWalkable(level);
    level.dwarves = [0, 1, 2].map(index => ({ x: mainHall.x + index - 1, y: mainHall.y }));
    return level;
  }

  function currentLevel() {
    return state.level;
  }

  function renderTerrain(level) {
    map.innerHTML = '';
    const layer = document.createElement('div');
    layer.className = 'fortress-map-layer';
    const canvas = document.createElement('canvas');
    canvas.className = 'fortress-canvas';
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.setAttribute('aria-label', 'Generated fortress map');
    canvas.addEventListener('click', event => {
      const bounds = canvas.getBoundingClientRect();
      const x = Math.min(WIDTH - 1, Math.max(0, Math.floor((event.clientX - bounds.left) / bounds.width * WIDTH)));
      const y = Math.min(HEIGHT - 1, Math.max(0, Math.floor((event.clientY - bounds.top) / bounds.height * HEIGHT)));
      inspectTile(x, y, level.roomAt.get(key(x, y)));
    });
    layer.append(canvas);
    drawMap(canvas, level);
    level.rooms.forEach(room => addRoomButton(room, layer));
    layer.append(...renderDwarves(level));
    map.append(layer);
    updateZoom();
  }

  function drawMap(canvas, level) {
    const context = canvas.getContext('2d');
    const cellWidth = canvas.width / WIDTH;
    const cellHeight = canvas.height / HEIGHT;
    context.fillStyle = '#0b1117';
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const type = level.tiles[y][x];
        const room = level.roomAt.get(key(x, y));
        if (type === TILE.WALL) {
          context.fillStyle = '#111a22';
        } else if (type === TILE.STAIRS) {
          context.fillStyle = '#f6d477';
        } else if (room) {
          context.fillStyle = '#123444';
        } else {
          context.fillStyle = '#23677a';
        }
        context.fillRect(x * cellWidth, y * cellHeight, cellWidth + 0.3, cellHeight + 0.3);
      }
    }
  }

  function addRoomButton(room, layer) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `fortress-room fortress-room--${room.className}`;
    button.style.left = `${room.x / WIDTH * 100}%`;
    button.style.top = `${room.y / HEIGHT * 100}%`;
    button.style.width = `${room.width / WIDTH * 100}%`;
    button.style.height = `${room.height / HEIGHT * 100}%`;
    button.style.setProperty('--room-x', room.x);
    button.style.setProperty('--room-y', room.y);
    button.style.setProperty('--room-width', room.width);
    button.style.setProperty('--room-height', room.height);
    button.setAttribute('aria-label', `${room.title}: ${room.subtitle}`);
    button.innerHTML = `<span class="fortress-room__symbol">${room.symbol}</span><span class="fortress-room__title">${room.title}</span><span class="fortress-room__subtitle">${room.subtitle}</span>`;
    button.addEventListener('click', event => {
      event.stopPropagation();
      map.querySelectorAll('.fortress-room.is-selected').forEach(element => element.classList.remove('is-selected'));
      button.classList.add('is-selected');
      addEvent(`Selected ${room.title}.`);
    });
    layer.append(button);
  }

  function renderDwarves(level) {
    const dwarves = [];
    level.dwarves.forEach((dwarf, index) => {
      const element = document.createElement('span');
      element.className = 'fortress-dwarf';
      element.textContent = '◆';
      element.style.left = `${(dwarf.x + 0.5) / WIDTH * 100}%`;
      element.style.top = `${(dwarf.y + 0.5) / HEIGHT * 100}%`;
      element.style.setProperty('--dwarf-delay', `${index * 0.18}s`);
      element.setAttribute('aria-hidden', 'true');
      dwarves.push(element);
    });
    return dwarves;
  }

  function updateDwarves(level) {
    map.querySelectorAll('.fortress-dwarf').forEach((element, index) => {
      const dwarf = level.dwarves[index];
      if (!dwarf) return;
      element.style.left = `${(dwarf.x + 0.5) / WIDTH * 100}%`;
      element.style.top = `${(dwarf.y + 0.5) / HEIGHT * 100}%`;
    });
  }

  function updateZoom() {
    map.style.setProperty('--fortress-zoom', state.zoom);
    if (zoomValue) zoomValue.textContent = `${Math.round(state.zoom * 100)}%`;
    if (zoomOutButton) zoomOutButton.disabled = state.zoom <= 0.75;
    if (zoomInButton) zoomInButton.disabled = state.zoom >= 1.5;
  }

  function inspectTile(x, y, room) {
    if (!state.inspect) return;
    const tile = currentLevel().tiles[y][x];
    const label = tile === TILE.STAIRS ? 'stairwell' : tile === TILE.FLOOR ? 'excavated floor' : room ? room.title : 'stone wall';
    addEvent(`Surveyed ${label} at ${x}, ${y}.`);
  }

  function render() {
    renderTerrain(currentLevel());
    inspectButton.textContent = `Inspect: ${state.inspect ? 'On' : 'Off'}`;
    inspectButton.setAttribute('aria-pressed', String(state.inspect));
  }

  function activateArticle(tab) {
    const articleId = tab.getAttribute('aria-controls');
    document.querySelectorAll('.fortress-article-tab').forEach(button => {
      const active = button === tab;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('.fortress-article').forEach(article => {
      const active = article.id === articleId;
      article.hidden = !active;
      article.classList.toggle('is-active', active);
    });
  }

  function moveDwarves() {
    const level = currentLevel();
    level.dwarves.forEach(dwarf => {
      const candidates = [[1, 0], [-1, 0], [0, 1], [0, -1]]
        .map(([dx, dy]) => ({ x: dwarf.x + dx, y: dwarf.y + dy }))
        .filter(candidate => level.walkable.has(key(candidate.x, candidate.y)));
      if (candidates.length) Object.assign(dwarf, candidates[Math.floor(Math.random() * candidates.length)]);
    });
    updateDwarves(level);
    window.setTimeout(moveDwarves, 1500 + Math.random() * 500);
  }

  function regenerate() {
    state.level = generateFortress();
    state.events = [];
    addEvent('A new 80 × 80 fortress was carved with BSP and cellular automata.');
    addEvent('Main stairwell, rooms, corridors, and mining shafts connected.');
    render();
  }

  inspectButton.addEventListener('click', () => {
    state.inspect = !state.inspect;
    addEvent(state.inspect ? 'Survey mode enabled. Select a visible tile.' : 'Survey mode disabled.');
    render();
  });
  regenerateButton.addEventListener('click', regenerate);
  zoomOutButton?.addEventListener('click', () => {
    state.zoom = Math.max(0.75, Number((state.zoom - 0.25).toFixed(2)));
    updateZoom();
  });
  zoomInButton?.addEventListener('click', () => {
    state.zoom = Math.min(1.5, Number((state.zoom + 0.25).toFixed(2)));
    updateZoom();
  });
  zoomResetButton?.addEventListener('click', () => {
    state.zoom = 1;
    updateZoom();
  });
  document.querySelectorAll('.fortress-article-tab').forEach(tab => {
    tab.addEventListener('click', () => activateArticle(tab));
  });

  state.level = generateFortress();
  addEvent('The central stairwell was opened.');
  addEvent('BSP sectors and mining shafts connected to the main hall.');
  render();
  window.setTimeout(moveDwarves, 1700);
  window.setInterval(() => {
    const events = ['A miner found a promising vein near a fan shaft.', 'The main hall echoes with distant hammer blows.', 'A new room boundary has been marked in the stone.', 'The watch reports every route remains connected.'];
    addEvent(events[Math.floor(Math.random() * events.length)]);
  }, 9000);
})();
