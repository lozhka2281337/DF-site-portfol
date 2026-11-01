(() => {
  'use strict';

  const WIDTH = 32;
  const HEIGHT = 18;
  const FLOOR_NAMES = ['Surface', 'Deep Halls', 'Mines'];
  const map = document.getElementById('fortress-map');
  const eventLog = document.getElementById('fortress-event-log');
  const inspectButton = document.getElementById('fortress-inspect');
  const regenerateButton = document.getElementById('fortress-regenerate');
  if (!map || !eventLog) return;

  const roomSpecs = [
    { id: 'throne', title: '👑 Grand Hall', subtitle: 'Central gathering room', symbol: '♛', className: 'gold', width: 7, height: 4, quadrant: 'top-left' },
    { id: 'barracks', title: '⚔ Barracks / Forge', subtitle: 'Defense and workshops', symbol: '⚔', className: 'cyan', width: 7, height: 4, quadrant: 'top-right' },
    { id: 'treasury', title: '💎 Treasury', subtitle: 'Storage and stockpiles', symbol: '◆', className: 'violet', width: 7, height: 4, quadrant: 'bottom-left' },
    { id: 'tavern', title: '🍺 Tavern', subtitle: 'Rest and social hall', symbol: '♟', className: 'green', width: 7, height: 4, quadrant: 'bottom-right' }
  ];

  const state = { levels: [], currentFloor: 0, inspect: false, events: [] };

  const key = (x, y) => `${x}:${y}`;
  const randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

  function addEvent(message) {
    state.events.push(message);
    state.events = state.events.slice(-6);
    eventLog.innerHTML = state.events.map(event => `<li>${event}</li>`).join('');
  }

  function roomCandidate(spec) {
    const ranges = {
      'top-left': [2, 11, 2, 5],
      'top-right': [20, 23, 2, 5],
      'bottom-left': [2, 11, 9, 12],
      'bottom-right': [20, 23, 9, 12]
    };
    const [minX, maxX, minY, maxY] = ranges[spec.quadrant];
    return { ...spec, x: randomBetween(minX, maxX), y: randomBetween(minY, maxY) };
  }

  function overlaps(a, b) {
    return a.x < b.x + b.width + 1 && a.x + a.width + 1 > b.x &&
      a.y < b.y + b.height + 1 && a.y + a.height + 1 > b.y;
  }

  function carve(level, x, y) {
    if (x >= 0 && y >= 0 && x < WIDTH && y < HEIGHT) level.walkable.add(key(x, y));
  }

  function corridor(level, from, to) {
    const points = Math.random() > 0.5
      ? [[from.x, from.y], [to.x, from.y], [to.x, to.y]]
      : [[from.x, from.y], [from.x, to.y], [to.x, to.y]];
    for (let i = 0; i < points.length - 1; i++) {
      let [x, y] = points[i];
      const [endX, endY] = points[i + 1];
      while (true) {
        carve(level, x, y);
        carve(level, x + 1, y);
        carve(level, x, y + 1);
        if (x === endX && y === endY) break;
        x += Math.sign(endX - x);
        y += Math.sign(endY - y);
      }
    }
  }

  function reveal(level) {
    level.dwarves.forEach(dwarf => {
      for (let y = dwarf.y - 3; y <= dwarf.y + 3; y++) {
        for (let x = dwarf.x - 3; x <= dwarf.x + 3; x++) {
          if (level.walkable.has(key(x, y))) level.discovered.add(key(x, y));
        }
      }
    });
  }

  function generateLevel(floor) {
    const level = { rooms: [], roomAt: new Map(), walkable: new Set(), discovered: new Set(), dwarves: [] };
    roomSpecs.forEach(spec => {
      let room = roomCandidate(spec);
      for (let attempt = 0; attempt < 30 && level.rooms.some(existing => overlaps(room, existing)); attempt++) room = roomCandidate(spec);
      room.floor = floor;
      level.rooms.push(room);
      for (let y = room.y; y < room.y + room.height; y++) {
        for (let x = room.x; x < room.x + room.width; x++) {
          carve(level, x, y);
          level.roomAt.set(key(x, y), room);
        }
      }
    });
    const center = { x: 16, y: 9 };
    level.rooms.forEach(room => corridor(level, center, { x: room.x + 3, y: room.y + 2 }));
    for (let i = 0; i < level.rooms.length; i++) {
      const a = level.rooms[i];
      const b = level.rooms[(i + 1) % level.rooms.length];
      corridor(level, { x: a.x + 3, y: a.y + 2 }, { x: b.x + 3, y: b.y + 2 });
    }
    for (let i = 0; i < 3; i++) level.dwarves.push({ x: center.x + i - 1, y: center.y });
    level.rooms.forEach(room => {
      for (let y = room.y; y < room.y + room.height; y++) {
        for (let x = room.x; x < room.x + room.width; x++) level.discovered.add(key(x, y));
      }
    });
    reveal(level);
    return level;
  }

  function currentLevel() {
    return state.levels[state.currentFloor];
  }

  function renderTerrain(level) {
    map.innerHTML = '';
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const tile = document.createElement('button');
        const tileKey = key(x, y);
        const room = level.roomAt.get(tileKey);
        const visible = level.discovered.has(tileKey) || room;
        const corridorTile = level.walkable.has(tileKey) && !room;
        tile.type = 'button';
        tile.className = `fortress-terrain ${room ? `fortress-terrain--${room.className}` : corridorTile ? 'fortress-terrain--corridor' : 'fortress-terrain--wall'}${visible ? '' : ' is-fogged'}`;
        tile.textContent = visible ? (room ? '·' : corridorTile ? '·' : '▓') : '░';
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
    button.addEventListener('click', event => { event.stopPropagation(); selectRoom(room, button); });
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
    addEvent(`${FLOOR_NAMES[state.currentFloor]}: surveyed ${room ? room.title : levelLabel(currentLevel(), x, y)} at ${x}, ${y}.`);
  }

  function levelLabel(level, x, y) {
    return level.walkable.has(key(x, y)) ? 'walkable passage' : 'unmapped stone';
  }

  function selectRoom(room, button) {
    map.querySelectorAll('.fortress-room.is-selected').forEach(element => element.classList.remove('is-selected'));
    button.classList.add('is-selected');
    addEvent(`${FLOOR_NAMES[state.currentFloor]}: selected ${room.title}.`);
  }

  function render() {
    renderTerrain(currentLevel());
    document.querySelectorAll('[data-floor]').forEach(button => button.classList.toggle('is-active', Number(button.dataset.floor) === state.currentFloor));
    inspectButton.textContent = `Inspect: ${state.inspect ? 'On' : 'Off'}`;
    inspectButton.setAttribute('aria-pressed', String(state.inspect));
  }

  function moveDwarves() {
    state.levels.forEach(level => {
      level.dwarves.forEach(dwarf => {
        const candidates = [[1, 0], [-1, 0], [0, 1], [0, -1]]
          .map(([dx, dy]) => ({ x: dwarf.x + dx, y: dwarf.y + dy }))
          .filter(candidate => level.walkable.has(key(candidate.x, candidate.y)));
        if (candidates.length) Object.assign(dwarf, candidates[Math.floor(Math.random() * candidates.length)]);
      });
      reveal(level);
    });
    render();
    window.setTimeout(moveDwarves, 1500 + Math.random() * 500);
  }

  function regenerate() {
    state.levels = [0, 1, 2].map(generateLevel);
    state.currentFloor = 0;
    state.events = [];
    addEvent('A new fortress seed has been carved into the mountain.');
    addEvent('Three levels are ready for inspection.');
    render();
  }

  function activateArticle(tab) {
    const articleId = tab.getAttribute('aria-controls');
    document.querySelectorAll('.fortress-article-tab').forEach(button => {
      const active = button === tab;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('.fortress-article').forEach(article => {
      article.hidden = article.id !== articleId;
      article.classList.toggle('is-active', article.id === articleId);
    });
  }

  document.querySelectorAll('[data-floor]').forEach(button => button.addEventListener('click', () => {
    state.currentFloor = Number(button.dataset.floor);
    addEvent(`Moved to ${FLOOR_NAMES[state.currentFloor]}.`);
    render();
  }));
  inspectButton.addEventListener('click', () => {
    state.inspect = !state.inspect;
    addEvent(state.inspect ? 'Survey mode enabled. Select a visible tile.' : 'Survey mode disabled.');
    render();
  });
  regenerateButton.addEventListener('click', regenerate);
  document.querySelectorAll('.fortress-article-tab').forEach(tab => {
    tab.addEventListener('click', () => activateArticle(tab));
  });

  state.levels = [0, 1, 2].map(generateLevel);
  addEvent('The fortress was founded beneath the mountain.');
  addEvent('Dwarves are mapping the first corridors.');
  render();
  window.setTimeout(moveDwarves, 1700);
  window.setInterval(() => {
    const events = ['A miner reports a glimmer in the deep halls.', 'A distant hammer rings through the fortress.', 'A forgotten corridor has been marked for review.', 'The tavern lanterns flicker: another expedition begins.'];
    addEvent(events[Math.floor(Math.random() * events.length)]);
  }, 9000);
})();
