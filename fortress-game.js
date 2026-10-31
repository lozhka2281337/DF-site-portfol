(() => {
  'use strict';

  const state = {
    stone: 0,
    iron: 0,
    walls: 0,
    health: 100,
    wave: 0,
    rooms: 0,
    log: []
  };
  const mapSize = 25;

  const elements = {
    stone: document.getElementById('game-stone'),
    iron: document.getElementById('game-iron'),
    walls: document.getElementById('game-walls'),
    health: document.getElementById('game-health'),
    wave: document.getElementById('game-wave'),
    status: document.getElementById('fortress-game-status'),
    map: document.getElementById('fortress-map'),
    log: document.getElementById('fortress-game-log')
  };

  function addLog(message) {
    state.log.unshift(message);
    state.log = state.log.slice(0, 4);
  }

  function renderMap() {
    const cells = Array.from({ length: mapSize }, () => '·');
    const center = Math.floor(mapSize / 2);
    const centerCell = center * mapSize + center;
    cells[centerCell] = '╬';
    if (state.rooms > 0) cells[centerCell - 1] = '□';
    if (state.rooms > 1) cells[centerCell + 1] = '□';
    if (state.rooms > 2) cells[centerCell - mapSize] = '□';
    if (state.rooms > 3) cells[centerCell + mapSize] = '□';
    if (state.walls > 0) {
      cells[0] = '▓';
      cells[mapSize - 1] = '▓';
      cells[mapSize * (mapSize - 1)] = '▓';
      cells[mapSize * mapSize - 1] = '▓';
    }

    elements.map.innerHTML = '';
    cells.forEach((cell, index) => {
      const tile = document.createElement('span');
      tile.textContent = cell;
      tile.className = cell === '╬' ? 'fortress-map__core' : '';
      tile.setAttribute('aria-hidden', 'true');
      tile.style.setProperty('--tile-delay', `${index * 5}ms`);
      elements.map.append(tile);
    });
  }

  function render() {
    elements.stone.textContent = state.stone;
    elements.iron.textContent = state.iron;
    elements.walls.textContent = state.walls;
    elements.health.textContent = state.health;
    elements.wave.textContent = state.wave;
    elements.status.textContent = state.health <= 0 ? 'Fortress fallen' : 'Awaiting orders';
    elements.log.innerHTML = state.log.map(message => `<li>${message}</li>`).join('');
    renderMap();
  }

  function mine() {
    if (state.health <= 0) return;
    state.stone += 2;
    if (Math.random() > 0.45) state.iron += 1;
    addLog('⛏ Expedition returned with stone and ore.');
    elements.status.textContent = 'Resources secured';
    render();
  }

  function build() {
    if (state.health <= 0) return;
    if (state.stone < 5) {
      addLog('▱ Not enough stone. Mine more resources.');
      elements.status.textContent = 'Construction paused';
      render();
      return;
    }
    state.stone -= 5;
    state.rooms += 1;
    state.walls += 1;
    addLog(`▦ Room ${state.rooms} reinforced. The fortress grows.`);
    elements.status.textContent = 'Room constructed';
    render();
  }

  function defend() {
    if (state.health <= 0) return;
    state.wave += 1;
    const damage = Math.max(0, 12 - state.walls * 3);
    state.health = Math.max(0, state.health - damage);
    if (state.iron >= 2) {
      state.iron -= 2;
      state.health = Math.min(100, state.health + 8);
      addLog(`⚔ Wave ${state.wave} repelled. Iron repairs restored the citadel.`);
    } else {
      addLog(`⚠ Wave ${state.wave} hit the walls for ${damage} damage.`);
    }
    elements.status.textContent = state.health <= 0 ? 'Fortress fallen' : 'Wave survived';
    render();
  }

  function reset() {
    Object.assign(state, { stone: 0, iron: 0, walls: 0, health: 100, wave: 0, rooms: 0, log: ['The expedition begins at a new outpost.'] });
    render();
  }

  document.querySelectorAll('[data-game-action]').forEach(button => {
    button.addEventListener('click', () => {
      const actions = { mine, build, defend, reset };
      actions[button.dataset.gameAction]();
    });
  });

  reset();
})();
