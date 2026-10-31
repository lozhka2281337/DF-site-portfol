(() => {
  'use strict';

  const WIDTH = 32;
  const HEIGHT = 18;
  const map = document.getElementById('resume-fortress-map');
  const lore = document.getElementById('fortress-lore-content');
  if (!map || !lore) return;

  const rooms = [
    {
      id: 'throne',
      title: '👑 Throne Hall',
      subtitle: 'About / Main archive',
      symbol: '♛',
      className: 'gold',
      x: 3, y: 3, width: 8, height: 5,
      content: '<h2>About the Keeper</h2><p>I am Nikolai, a Computer Science and Applied Mathematics student focused on systems, algorithms, and understanding how things work under the hood.</p><p class="lore-meta">FEFU (RUSSIA) · ПМИ · 2nd year</p>',
      target: 'about'
    },
    {
      id: 'barracks',
      title: '⚔ Barracks / Forge',
      subtitle: 'Stack / Skills archive',
      symbol: '⚔',
      className: 'cyan',
      x: 21, y: 3, width: 8, height: 5,
      content: '<h2>Tools of the Fortress</h2><div class="lore-tags"><span>C</span><span>NASM</span><span>Algorithms</span><span>Linux</span><span>Networks</span><span>HTML / CSS / JS</span><span>Python</span></div><p>From low-level experiments to interactive interfaces, every tool is chosen to understand the system better.</p>',
      target: 'skills'
    },
    {
      id: 'treasury',
      title: '💎 Treasury',
      subtitle: 'Projects / Expeditions archive',
      symbol: '◆',
      className: 'violet',
      x: 3, y: 11, width: 8, height: 5,
      content: '<h2>Project Expeditions</h2><p><strong>Cyber_Puk_Pygame</strong> — a rogue-like game in Python and pygame.</p><p><strong>chat-server</strong> — a Linux chat server written in C.</p><p><strong>One-PM-Calc</strong> — a lightweight 1RM calculator in C.</p>',
      target: 'projects'
    },
    {
      id: 'tavern',
      title: '🍺 Tavern',
      subtitle: 'Contacts / Socials archive',
      symbol: '♟',
      className: 'green',
      x: 21, y: 11, width: 8, height: 5,
      content: '<h2>Open a Channel</h2><p>Available for conversations about systems, algorithms, games, and new expeditions.</p><ul class="lore-links"><li><a href="mailto:zhukovskii.nm@dvfu.ru">Email</a></li><li><a href="https://github.com/lozhka2281337" target="_blank" rel="noopener noreferrer">GitHub</a></li><li><a href="https://t.me/poveliteldoti" target="_blank" rel="noopener noreferrer">Telegram</a></li></ul>',
      target: 'contacts'
    }
  ];

  const roomAt = new Map();
  const walkable = new Set();
  const dwarves = [
    { x: 15, y: 8 },
    { x: 16, y: 9 },
    { x: 14, y: 8 }
  ];

  function key(x, y) {
    return `${x}:${y}`;
  }

  function isInsideRoom(x, y, room) {
    return x >= room.x && x < room.x + room.width && y >= room.y && y < room.y + room.height;
  }

  function buildWorld() {
    rooms.forEach(room => {
      for (let y = room.y; y < room.y + room.height; y++) {
        for (let x = room.x; x < room.x + room.width; x++) {
          walkable.add(key(x, y));
          roomAt.set(key(x, y), room);
        }
      }
    });
    for (let x = 0; x < WIDTH; x++) {
      walkable.add(key(x, 8));
      walkable.add(key(x, 9));
    }
    for (let y = 0; y < HEIGHT; y++) {
      walkable.add(key(15, y));
      walkable.add(key(16, y));
    }
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

  function renderTerrain() {
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

  buildWorld();
  renderTerrain();
  renderDwarves();
  lore.innerHTML = '<h2>Крепость успешно заложена.</h2><p>Выберите комнату для исследования летописей, навыков, проектов и связей.</p><p class="lore-meta">Живой мир активен · 3 дварфа патрулируют коридоры</p>';
  window.setTimeout(moveDwarves, 1700);
})();
