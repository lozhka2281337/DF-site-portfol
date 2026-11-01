(() => {
  'use strict';

  const WIDTH = 32;
  const HEIGHT = 18;
  const map = document.getElementById('resume-fortress-map');
  const lore = document.getElementById('fortress-lore-content');
  if (!map || !lore) return;

  const roomSpecs = [
    {
      id: 'throne',
      title: '👑 Throne Hall',
      subtitle: 'About / Main archive',
      symbol: '♛',
      className: 'gold',
      width: 7,
      height: 4,
      quadrant: 'top-left',
      content: '<h2>About the Keeper</h2><p>I am Nikolai, a Computer Science and Applied Mathematics student focused on systems, algorithms, and understanding how things work under the hood.</p><p class="lore-meta">FEFU (RUSSIA) · ПМИ · 2nd year</p>',
      target: 'about'
    },
    {
      id: 'barracks',
      title: '⚔ Barracks / Forge',
      subtitle: 'Stack / Skills archive',
      symbol: '⚔',
      className: 'cyan',
      width: 7,
      height: 4,
      quadrant: 'top-right',
      content: '<h2>Tools of the Fortress</h2><div class="lore-tags"><span>C</span><span>NASM</span><span>Algorithms</span><span>Linux</span><span>Networks</span><span>HTML / CSS / JS</span><span>Python</span></div><p>From low-level experiments to interactive interfaces, every tool is chosen to understand the system better.</p>',
      target: 'skills'
    },
    {
      id: 'treasury',
      title: '💎 Treasury',
      subtitle: 'Projects / Expeditions archive',
      symbol: '◆',
      className: 'violet',
      width: 7,
      height: 4,
      quadrant: 'bottom-left',
      content: '<h2>Project Expeditions</h2><p><strong>Cyber_Puk_Pygame</strong> — a rogue-like game in Python and pygame.</p><p><strong>chat-server</strong> — a Linux chat server written in C.</p><p><strong>One-PM-Calc</strong> — a lightweight 1RM calculator in C.</p>',
      target: 'projects'
    },
    {
      id: 'tavern',
      title: '🍺 Tavern',
      subtitle: 'Contacts / Socials archive',
      symbol: '♟',
      className: 'green',
      width: 7,
      height: 4,
      quadrant: 'bottom-right',
      content: '<h2>Open a Channel</h2><p>Available for conversations about systems, algorithms, games, and new expeditions.</p><ul class="lore-links"><li><a href="mailto:zhukovskii.nm@dvfu.ru">Email</a></li><li><a href="https://github.com/lozhka2281337" target="_blank" rel="noopener noreferrer">GitHub</a></li><li><a href="https://t.me/poveliteldoti" target="_blank" rel="noopener noreferrer">Telegram</a></li></ul>',
      target: 'contacts'
    }
  ];

  const roomAt = new Map();
  const walkable = new Set();
  const dwarves = [];

  function key(x, y) {
    return `${x}:${y}`;
  }

  function randomBetween(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function overlaps(candidate, room) {
    return candidate.x < room.x + room.width + 1 &&
      candidate.x + candidate.width + 1 > room.x &&
      candidate.y < room.y + room.height + 1 &&
      candidate.y + candidate.height + 1 > room.y;
  }

  function candidateFor(spec) {
    const ranges = {
      'top-left': [2, 11, 2, 5],
      'top-right': [20, 23, 2, 5],
      'bottom-left': [2, 11, 9, 12],
      'bottom-right': [20, 23, 9, 12]
    };
    const [minX, maxX, minY, maxY] = ranges[spec.quadrant];
    return {
      ...spec,
      x: randomBetween(minX, maxX),
      y: randomBetween(minY, maxY)
    };
  }

  function generateRooms() {
    const generated = [];
    roomSpecs.forEach(spec => {
      let candidate = candidateFor(spec);
      for (let attempt = 0; attempt < 30 && generated.some(room => overlaps(candidate, room)); attempt++) {
        candidate = candidateFor(spec);
      }
      generated.push(candidate);
    });
    return generated;
  }

  function carve(x, y) {
    if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return;
    walkable.add(key(x, y));
  }

  function carveCorridor(from, to) {
    const horizontalFirst = Math.random() > 0.5;
    const points = horizontalFirst
      ? [[from.x, from.y], [to.x, from.y], [to.x, to.y]]
      : [[from.x, from.y], [from.x, to.y], [to.x, to.y]];
    for (let index = 0; index < points.length - 1; index++) {
      const [x1, y1] = points[index];
      const [x2, y2] = points[index + 1];
      const stepX = Math.sign(x2 - x1);
      const stepY = Math.sign(y2 - y1);
      let x = x1;
      let y = y1;
      while (true) {
        carve(x, y);
        carve(x + 1, y);
        carve(x, y + 1);
        if (x === x2 && y === y2) break;
        x += stepX;
        y += stepY;
      }
    }
  }

  function buildWorld() {
    const rooms = generateRooms();
    rooms.forEach(room => {
      for (let y = room.y; y < room.y + room.height; y++) {
        for (let x = room.x; x < room.x + room.width; x++) {
          carve(x, y);
          roomAt.set(key(x, y), room);
        }
      }
    });

    const center = { x: Math.floor(WIDTH / 2), y: Math.floor(HEIGHT / 2) };
    rooms.forEach(room => {
      carveCorridor(center, {
        x: room.x + Math.floor(room.width / 2),
        y: room.y + Math.floor(room.height / 2)
      });
    });
    for (let index = 0; index < rooms.length; index++) {
      const current = rooms[index];
      const next = rooms[(index + 1) % rooms.length];
      carveCorridor(
        { x: current.x + Math.floor(current.width / 2), y: current.y + Math.floor(current.height / 2) },
        { x: next.x + Math.floor(next.width / 2), y: next.y + Math.floor(next.height / 2) }
      );
    }

    for (let index = 0; index < 3; index++) {
      dwarves.push({ x: center.x + index - 1, y: center.y });
    }
    return rooms;
  }

  function addArchiveButton(room) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `fortress-room fortress-room--${room.className}`;
    button.style.setProperty('--room-x', room.x);
    button.style.setProperty('--room-y', room.y);
    button.style.setProperty('--room-width', room.width);
    button.style.setProperty('--room-height', room.height);
    button.setAttribute('aria-label', `${room.title}: ${room.subtitle}`);
    button.innerHTML = `<span class="fortress-room__symbol">${room.symbol}</span><span class="fortress-room__title">${room.title}</span><span class="fortress-room__subtitle">${room.subtitle}</span>`;
    button.addEventListener('click', () => selectRoom(room, button));
    map.append(button);
  }

  function renderTerrain(rooms) {
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const tile = document.createElement('span');
        const room = roomAt.get(key(x, y));
        const isCorridor = walkable.has(key(x, y)) && !room;
        tile.className = `fortress-terrain ${room ? `fortress-terrain--${room.className}` : isCorridor ? 'fortress-terrain--corridor' : 'fortress-terrain--wall'}`;
        tile.textContent = room ? '·' : isCorridor ? '·' : '▓';
        tile.style.setProperty('--tile-x', x);
        tile.style.setProperty('--tile-y', y);
        tile.setAttribute('aria-hidden', 'true');
        map.append(tile);
      }
    }
    rooms.forEach(addArchiveButton);
  }

  function renderDwarves() {
    map.querySelectorAll('.fortress-dwarf').forEach(element => element.remove());
    dwarves.forEach((dwarf, index) => {
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

  function selectRoom(room, button) {
    map.querySelectorAll('.fortress-room.is-selected').forEach(element => element.classList.remove('is-selected'));
    button.classList.add('is-selected');
    lore.classList.remove('is-revealing');
    void lore.offsetWidth;
    lore.innerHTML = `${room.content}<button type="button" class="lore-open" data-target="${room.target}">Open ${room.subtitle.split(' / ')[0]} archive →</button>`;
    lore.classList.add('is-revealing');
    lore.querySelector('.lore-open').addEventListener('click', event => {
      document.documentElement.dataset.mode = 'new';
      try { localStorage.setItem('df-site-mode', 'new'); } catch (error) { /* storage is optional */ }
      requestAnimationFrame(() => document.getElementById(event.currentTarget.dataset.target)?.scrollIntoView({ behavior: 'smooth' }));
    });
  }

  function moveDwarves() {
    dwarves.forEach(dwarf => {
      const candidates = [[1, 0], [-1, 0], [0, 1], [0, -1]]
        .map(([dx, dy]) => ({ x: dwarf.x + dx, y: dwarf.y + dy }))
        .filter(candidate => walkable.has(key(candidate.x, candidate.y)));
      if (candidates.length) Object.assign(dwarf, candidates[Math.floor(Math.random() * candidates.length)]);
    });
    renderDwarves();
    window.setTimeout(moveDwarves, 1500 + Math.random() * 500);
  }

  const rooms = buildWorld();
  renderTerrain(rooms);
  renderDwarves();
  lore.innerHTML = '<h2>Крепость успешно заложена.</h2><p>Подземелья сгенерированы. Выберите комнату для исследования летописей, навыков, проектов и связей.</p><p class="lore-meta">Живой мир активен · 3 дварфа патрулируют коридоры</p>';
  window.setTimeout(moveDwarves, 1700);
})();
