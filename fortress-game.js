(() => {
  'use strict';

  const MAP_WIDTH = 13;
  const MAP_HEIGHT = 9;
  const state = {};

  const elements = {
    turn: document.getElementById('game-turn'),
    dwarves: document.getElementById('game-dwarves'),
    warriors: document.getElementById('game-warriors'),
    food: document.getElementById('game-food'),
    stone: document.getElementById('game-stone'),
    iron: document.getElementById('game-iron'),
    wave: document.getElementById('game-wave'),
    status: document.getElementById('fortress-game-status'),
    map: document.getElementById('fortress-map'),
    log: document.getElementById('fortress-game-log')
  };

  function resetState() {
    Object.assign(state, {
      turn: 0,
      food: 30,
      stone: 10,
      iron: 0,
      dwarves: 3,
      warriors: 0,
      bedrooms: 0,
      farms: 0,
      forge: false,
      wave: 0,
      recruitTimers: [],
      status: 'Awaiting orders',
      log: ['A new expedition reaches the valley. Three dwarves await orders.']
    });
  }

  function freeDwarves() {
    return Math.max(0, state.dwarves - state.warriors);
  }

  function maxDwarves() {
    return 3 + state.bedrooms;
  }

  function addLog(message) {
    state.log.push(message);
    state.log = state.log.slice(-12);
  }

  function removeDwarves(amount, warriorsFirst) {
    let remaining = amount;
    if (warriorsFirst) {
      const lostWarriors = Math.min(state.warriors, remaining);
      state.warriors -= lostWarriors;
      state.dwarves -= lostWarriors;
      remaining -= lostWarriors;
    }
    if (remaining > 0) {
      const lostWorkers = Math.min(freeDwarves(), remaining);
      state.dwarves -= lostWorkers;
      remaining -= lostWorkers;
    }
    return amount - remaining;
  }

  function consumeTurn() {
    state.turn += 1;
    const foodNeeded = state.dwarves;
    const foodEaten = Math.min(state.food, foodNeeded);
    state.food -= foodEaten;
    const starving = foodNeeded - foodEaten;
    if (starving > 0) {
      const lost = removeDwarves(starving, false);
      addLog(`☠ Food ran out. ${lost} dwarf${lost === 1 ? '' : 's'} died of hunger.`);
    }

    if (state.farms > 0) {
      state.food += state.farms * 2;
      addLog(`♣ Mushroom farms produced ${state.farms * 2} food.`);
    }

    state.recruitTimers = state.recruitTimers.filter(timer => {
      timer -= 1;
      if (timer > 0) return true;
      if (state.dwarves < maxDwarves()) {
        state.dwarves += 1;
        addLog('⌂ A new dwarf arrived at the completed bedroom.');
      }
      return false;
    });

    if (state.turn % 15 === 0) resolveWave();
  }

  function resolveWave() {
    state.wave += 1;
    const attack = state.wave * 2;
    const defense = state.warriors * 2;
    if (defense >= attack) {
      addLog(`⚔ Turn ${state.turn}: goblin wave ${state.wave} repelled (${defense} defense vs ${attack} attack).`);
      state.status = 'Wave repelled';
      return;
    }
    const losses = removeDwarves(attack - defense, true);
    addLog(`⚠ Turn ${state.turn}: goblins broke through. ${losses} dwarf${losses === 1 ? '' : 's'} fell.`);
    state.status = state.dwarves > 0 ? 'Fortress damaged' : 'Fortress abandoned';
  }

  function renderMap() {
    const cells = Array.from({ length: MAP_WIDTH * MAP_HEIGHT }, () => ({ symbol: '·', type: 'ground' }));
    const centerX = Math.floor(MAP_WIDTH / 2);
    const centerY = Math.floor(MAP_HEIGHT / 2);
    const setCell = (x, y, symbol, type) => {
      cells[y * MAP_WIDTH + x] = { symbol, type };
    };

    for (let x = 0; x < MAP_WIDTH; x++) {
      setCell(x, 0, '▓', 'wall');
      setCell(x, MAP_HEIGHT - 1, '▓', 'wall');
    }
    for (let y = 0; y < MAP_HEIGHT; y++) {
      setCell(0, y, '▓', 'wall');
      setCell(MAP_WIDTH - 1, y, '▓', 'wall');
    }
    setCell(centerX, centerY, '╬', 'core');
    const plots = [
      [centerX - 2, centerY, 'bedroom'],
      [centerX + 2, centerY, 'bedroom'],
      [centerX, centerY - 2, 'farm'],
      [centerX, centerY + 2, 'forge']
    ];
    plots.forEach(([x, y, type]) => {
      const built = type === 'bedroom'
        ? state.bedrooms >= (x < centerX ? 1 : 2)
        : type === 'farm' ? state.farms > 0 : state.forge;
      if (built) setCell(x, y, type === 'bedroom' ? '⌂' : type === 'farm' ? '♣' : '⚒', type);
    });

    elements.map.innerHTML = '';
    cells.forEach(({ symbol, type }) => {
      const tile = document.createElement('span');
      tile.textContent = symbol;
      tile.className = `fortress-map__tile fortress-map__tile--${type}`;
      tile.setAttribute('aria-hidden', 'true');
      elements.map.append(tile);
    });
  }

  function render() {
    elements.turn.textContent = state.turn;
    elements.dwarves.textContent = `${state.dwarves} / ${maxDwarves()}`;
    elements.warriors.textContent = state.warriors;
    elements.food.textContent = state.food;
    elements.stone.textContent = state.stone;
    elements.iron.textContent = state.iron;
    elements.wave.textContent = state.wave;
    elements.status.textContent = state.status;
    elements.log.innerHTML = state.log.map(message => `<li>${message}</li>`).join('');
    elements.log.scrollTop = elements.log.scrollHeight;
    renderMap();

    document.querySelectorAll('[data-game-action]').forEach(button => {
      const action = button.dataset.gameAction;
      const disabled = state.dwarves === 0 ||
        (action === 'bedroom' && state.stone < 20) ||
        (action === 'farm' && (state.stone < 15 || state.iron < 5)) ||
        (action === 'forge' && (state.stone < 30 || state.iron < 10)) ||
        (action === 'warrior' && (!state.forge || state.iron < 5 || freeDwarves() < 1));
      button.disabled = disabled && action !== 'reset';
    });
  }

  function work(action) {
    if (state.dwarves === 0) return;
    if (action === 'mine') {
      const stone = 1 + Math.floor(Math.random() * 3);
      state.stone += stone;
      if (Math.random() < 0.2) {
        state.iron += 1;
        addLog(`⛏ You mined ${stone} stone and found 1 iron.`);
      } else {
        addLog(`⛏ You mined ${stone} stone.`);
      }
      state.status = 'Mining complete';
    } else {
      const gathered = (2 + Math.floor(Math.random() * 3)) * freeDwarves();
      state.food += gathered;
      addLog(`🍄 The free dwarves gathered ${gathered} mushrooms.`);
      state.status = 'Food gathered';
    }
    consumeTurn();
    render();
  }

  function build(type) {
    if (type === 'bedroom') {
      state.stone -= 20;
      state.bedrooms += 1;
      state.recruitTimers.push(3);
      addLog(`⌂ Bedroom built. A new dwarf will arrive in 3 turns.`);
      state.status = 'Bedroom constructed';
    } else if (type === 'farm') {
      state.stone -= 15;
      state.iron -= 5;
      state.farms += 1;
      addLog('♣ Mushroom farm built. It produces 2 food every turn.');
      state.status = 'Farm constructed';
    } else {
      state.stone -= 30;
      state.iron -= 10;
      state.forge = true;
      addLog('⚒ Forge built. You can now train warriors for 5 iron.');
      state.status = 'Forge constructed';
    }
    render();
  }

  function trainWarrior() {
    if (!state.forge || state.iron < 5 || freeDwarves() < 1) return;
    state.iron -= 5;
    state.warriors += 1;
    addLog('⚔ A dwarf took up a sword and became a warrior.');
    state.status = 'Warrior trained';
    render();
  }

  const actions = {
    mine: () => work('mine'),
    gather: () => work('gather'),
    bedroom: () => build('bedroom'),
    farm: () => build('farm'),
    forge: () => build('forge'),
    warrior: trainWarrior,
    reset: () => {
      resetState();
      render();
    }
  };

  document.querySelectorAll('[data-game-action]').forEach(button => {
    button.addEventListener('click', () => actions[button.dataset.gameAction]());
  });

  resetState();
  render();
})();
