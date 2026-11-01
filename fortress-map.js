(() => {
  'use strict';

  const WIDTH = 80;
  const HEIGHT = 80;
  const TILE = Object.freeze({ EMPTY: 0, WALL: 1, FLOOR: 2, STAIRS: 3 });
  const map = document.getElementById('fortress-map');
  const eventLog = document.getElementById('fortress-event-log');
  const inspectButton = document.getElementById('fortress-inspect');
  const regenerateButton = document.getElementById('fortress-regenerate');
  if (!map || !eventLog) return;

  const roomSpecs = [
    { id: 'grand-hall', title: '👑 Grand Hall', subtitle: 'Central gathering room', symbol: '♛', className: 'gold' },
    { id: 'barracks', title: '⚔ Barracks / Forge', subtitle: 'Defense and workshops', symbol: '⚔', className: 'cyan' },
    { id: 'treasury', title: '💎 Treasury', subtitle: 'Storage and stockpiles', symbol: '◆', className: 'violet' },
    { id: 'tavern', title: '🍺 Tavern', subtitle: 'Rest and social hall', symbol: '♟', className: 'green' }
  ];
  const state = { level: null, inspect: false, events: [] };
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

  function splitBsp(region, depth, leaves) {
    const canSplitVertically = region.width >= 24;
    const canSplitHorizontally = region.height >= 24;
    if (depth <= 0 || (!canSplitVertically && !canSplitHorizontally)) {
      leaves.push(region);
      return;
    }
    const splitVertical = canSplitVertically && (!canSplitHorizontally || Math.random() > 0.5);
    if (splitVertical) {
      const split = randomBetween(Math.floor(region.width * 0.38), Math.floor(region.width * 0.62));
      splitBsp({ x: region.x, y: region.y, width: split, height: region.height }, depth - 1, leaves);
      splitBsp({ x: region.x + split, y: region.y, width: region.width - split, height: region.height }, depth - 1, leaves);
    } else {
      const split = randomBetween(Math.floor(region.height * 0.38), Math.floor(region.height * 0.62));
      splitBsp({ x: region.x, y: region.y, width: region.width, height: split }, depth - 1, leaves);
      splitBsp({ x: region.x, y: region.y + split, width: region.width, height: region.height - split }, depth - 1, leaves);
    }
  }

  function roomFromLeaf(spec, leaf) {
    const width = randomBetween(Math.max(8, Math.floor(leaf.width * 0.45)), Math.max(10, leaf.width - 6));
    const height = randomBetween(Math.max(6, Math.floor(leaf.height * 0.45)), Math.max(8, leaf.height - 6));
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
    carveCorridor(level, { x: 2, y: center.y }, center, 3);
    carveCorridor(level, center, { x: center.x, y: HEIGHT - 3 }, 3);
    carveCorridor(level, { x: center.x, y: 2 }, center, 3);
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

  function reveal(level) {
    level.dwarves.forEach(dwarf => {
      for (let y = dwarf.y - 4; y <= dwarf.y + 4; y++) {
        for (let x = dwarf.x - 4; x <= dwarf.x + 4; x++) {
          if (inBounds(x, y) && level.walkable.has(key(x, y))) level.discovered.add(key(x, y));
        }
      }
    });
  }

  function generateFortress() {
    const level = { tiles: createGrid(), rooms: [], roomAt: new Map(), walkable: new Set(), discovered: new Set(), dwarves: [] };
    const leaves = [];
    splitBsp({ x: 2, y: 2, width: WIDTH - 4, height: HEIGHT - 4 }, 2, leaves);
    const mainHall = carveMainHall(level);
    roomSpecs.forEach((spec, index) => {
      const room = roomFromLeaf(spec, leaves[index % leaves.length]);
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
    level.rooms.forEach(room => {
      for (let y = room.y; y < room.y + room.height; y++) {
        for (let x = room.x; x < room.x + room.width; x++) level.discovered.add(key(x, y));
      }
    });
    reveal(level);
    return level;
  }

  function currentLevel() {
    return state.level;
  }

  function renderTerrain(level) {
    map.innerHTML = '';
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const tile = document.createElement('button');
        const tileKey = key(x, y);
        const room = level.roomAt.get(tileKey);
        const visible = level.discovered.has(tileKey) || room;
        const tileType = level.tiles[y][x];
        tile.type = 'button';
        tile.className = `fortress-terrain fortress-terrain--${tileType === TILE.WALL ? 'wall' : tileType === TILE.STAIRS ? 'stairs' : room ? room.className : 'corridor'}${visible ? '' : ' is-fogged'}`;
        tile.textContent = visible ? (tileType === TILE.WALL ? '▓' : tileType === TILE.STAIRS ? '≡' : '·') : '░';
        tile.style.setProperty('--tile-x', x);
        tile.style.setProperty('--tile-y', y);
        tile.setAttribute('aria-label', visible ? `Map tile ${x}, ${y}` : 'Unexplored map tile');
        tile.addEventListener('click', () => inspectTile(x, y, visible, room));
        map.append(tile);
      }
    }
    level.rooms.forEach(addRoomButton);
    renderDwarves(level);
  }

  function addRoomButton(room) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `fortress-room fortress-room--${room.className}`;
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
    map.append(button);
  }

  function renderDwarves(level) {
    level.dwarves.forEach((dwarf, index) => {
      const element = document.createElement('span');
      element.className = 'fortress-dwarf';
      element.textContent = '◆';
      element.style.setProperty('--dwarf-x', dwarf.x);
      element.style.setProperty('--dwarf-y', dwarf.y);
      element.style.setProperty('--dwarf-delay', `${index * 0.18}s`);
      element.setAttribute('aria-hidden', 'true');
      map.append(element);
    });
  }

  function inspectTile(x, y, visible, room) {
    if (!state.inspect || !visible) return;
    const tile = currentLevel().tiles[y][x];
    const label = tile === TILE.STAIRS ? 'stairwell' : tile === TILE.FLOOR ? 'excavated floor' : room ? room.title : 'stone wall';
    addEvent(`Surveyed ${label} at ${x}, ${y}.`);
  }

  function render() {
    renderTerrain(currentLevel());
    inspectButton.textContent = `Inspect: ${state.inspect ? 'On' : 'Off'}`;
    inspectButton.setAttribute('aria-pressed', String(state.inspect));
  }

  function moveDwarves() {
    const level = currentLevel();
    level.dwarves.forEach(dwarf => {
      const candidates = [[1, 0], [-1, 0], [0, 1], [0, -1]]
        .map(([dx, dy]) => ({ x: dwarf.x + dx, y: dwarf.y + dy }))
        .filter(candidate => level.walkable.has(key(candidate.x, candidate.y)));
      if (candidates.length) Object.assign(dwarf, candidates[Math.floor(Math.random() * candidates.length)]);
    });
    reveal(level);
    render();
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
