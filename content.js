window.DF = window.DF || {};

/* ─────────────────────────────────────────────────────────────
 * TILE TEXTS
 * ──────────────────────────────────────────────────────────── */
DF.TILE_TEXT = {
  water:    { name: 'Water',        desc: 'A deep river flowing from the mountains.' },
  shallow:  { name: 'Shallow Water',desc: 'Can be crossed on foot.' },
  bank:     { name: 'Slope',        desc: 'Sandy river bank.' },

  grass:    { name: 'Grass',        desc: 'Grass.' },
  tree:     { name: 'Tree',         desc: 'An old tree. Shadow and coolness.' },
  bush:     { name: 'Bush',         desc: 'A berry bush.' },
  shrub:    { name: 'Shrub',        desc: 'A small shrub.' },
  flower:   { name: 'Flower',       desc: 'A yellow wildflower.' },
  flower2:  { name: 'Flower',       desc: 'A pink wildflower.' },

  wall:     { name: 'Stone',        desc: 'Granite.' },
  limestone:{ name: 'Stone',        desc: 'Limestone.' },
  obsidian: { name: 'Obsidian',     desc: 'Volcanic glass.' },
  cracked:  { name: 'Crack',        desc: 'Cracked stone.' },
  built:    { name: 'Block Wall',   desc: 'A constructed wall.' },
  pillar:   { name: 'Pillar',       desc: 'A stone pillar.' },
  floor:    { name: 'Floor',        desc: 'A stone floor.' },
  dirt:     { name: 'Dirt',         desc: 'A trodden dirt path.' },
  stairs:   { name: 'Stairs',       desc: 'Stairs to another z-level.' },
};

/* ─────────────────────────────────────────────────────────────
 * MAIN CONTENT
 * ──────────────────────────────────────────────────────────── */
DF.CONTENT = {

  /* ═══════════ TOP BAR ═══════════ */
  topbar: {
    title:    "⚔ FORTRESS 'ABOUT ME'",
    subtitle: 'Outpost',
    date:     '15th Granite 2026',
    stats: {
      pop:   { label: 'Pop:',   value: '☺6',   color: '#00ff22' },
      idle:  { label: '',       value: '☻0',   color: '#666666' },
      food:  { label: 'Food:',  value: '~60',  color: '#ffdd00' },
      drink: { label: 'Drink:', value: '~60',  color: '#44aaff' },
      goods: { label: 'Goods:', value: '~30',  color: '#ffaa44' },
      other: { label: 'Other:', value: 'None', color: '#666666' },
    },
  },

  /* ═══════════ OWNER PANEL ═══════════ */
  owner: {
    title: '⛏ OWNER',
    rows: [
      { key: 'Name:',        value: 'Nikolai' },
      { key: 'Education:',   value: 'FEFU · ПМИ · 2nd year' },
      { key: 'Focus:',       value: 'C/C++, NASM, Python, algorithms' },
      { key: 'Mood:',         value: 'Aiming for an A', color: '#00ff22' },
    ],
  },

  /* ═══════════ CONTROLS ═══════════ */
  controls: {
    title: '📖 CONTROLS',
    lines: [
      'WASD / ← ↑ ↓ → — move',
      'Click — examine',
      'R — center on hero',
      'Tab — toggle panel',
    ],
  },

  /* ═══════════ WELCOME ═══════════ */
  welcome: {
    title:     'ℹ EXAMINE',
    infoTitle: 'Welcome',
    infoDesc:  'You have arrived at the gates. Approach the structures within the mountain ' +
               '(Æ workshop, π library, Ñ throne, ╬ trade depot, $ treasury) ' +
               'to learn more about the fortress owner.',
  },

  /* ═══════════ LEGEND ═══════════ */
  legend: {
    title: 'LEGEND',
    items: [
      { ch: '☺', fg: '#00ffff', label: 'You (dwarf)' },
      { ch: '☺', fg: '#00ff22', label: 'Citizen' },
      { ch: '▲', fg: '#00ff22', label: 'Tree' },
      { ch: '▼', fg: '#c8b48c', label: 'Slope / bank' },
      { ch: '~', fg: '#44aaff', label: 'Water' },
      { ch: '▓', fg: '#555555', label: 'Stone' },
      { ch: 'Æ', fg: '#00ffff', label: 'Workshop' },
      { ch: 'Ñ', fg: '#ffff00', label: 'Throne' },
      { ch: '╬', fg: '#00ffff', label: 'Depot / contact' },
      { ch: '$', fg: '#ffaa00', label: 'Treasure' },
      { ch: 'c', fg: '#ffffff', label: 'Cat' },
    ],
  },

  /* ═══════════ PLAYER ═══════════ */
  player: {
    x: 40, y: 56,
    ch: '☺', fg: '#00ffff',
    name: 'You',
    desc: 'FEFU student, ПМИ, 2nd year. Mood: Focused.\n' +
          'Focus: C/C++, NASM, Python, algorithms.\n' +
          'Interests: heavy music, gym, electric guitar.',
  },

  /* ═══════════ NPCs ═══════════ */
  npcs: [
    {
      x: 28, y: 45, ch: '☺', fg: '#00ff22',
      name: 'Farmer',
      desc: 'Grows coffee for the fortress. Yield this season — 5 cups a day.',
    },
    {
      x: 48, y: 50, ch: 'E', fg: '#00ff22',
      name: 'Elf Trader',
      desc: 'Offers organic tea and gluten-free certified coffee.',
    },
    {
      x: 70, y: 56, ch: '☺', fg: '#ff2200',
      name: 'Guard',
      desc: 'Protects the program from bugs and uncommitted changes.',
    },
    {
      x: 100, y: 50, ch: 'c', fg: '#ffffff',
      name: 'Cat',
      desc: 'The cat is lying on the keyboard. This is a good omen. Coding progress -50%.',
    },
    {
      x: 88, y: 82, ch: '☺', fg: '#00ffff',
      name: 'Scholar',
      desc: 'Reading "Stolyarov: Introduction to Programming" for the third time. Claims he "finally gets it".',
    },
  ],

  /* ═══════════ INTERACTIVE OBJECTS ═══════════ */
  objects: [
    /* ── Forge: Projects ── */
    {
      x: 65, y: 38, ch: 'Æ', fg: '#00ffff',
      name: 'Forge',
      desc: 'The forge is red-hot. Artifacts forged here:\n\n' +
            '  ☼ «Cyber_Puk_Pygame» — rogue-like game (Python)\n' +
            '  ☼ «chat-server» — linux chat server (C)\n' +
            '  ☼ «One-PM-Calc» — 1PM calculator for bench/squat/deadlift (C)\n' +
            '  ☼ «Portfolio» — business card website (HTML/CSS/JS)\n',
      link: 'https://github.com/lozhka2281337',
      linkText: '→ Open GitHub',
    },
    {
      x: 67, y: 45, ch: '*', fg: '#ffaa00',
      name: 'Anvil',
      desc: 'A still-warm artifact rests on the anvil.',
    },

    /* ── Treasury ── */
    {
      x: 65, y: 68, ch: '$', fg: '#ffaa00',
      name: 'Treasure Chest',
      desc: 'The treasury is full:\n\n' +
            '  💰 180+ solved problems on Codeforces\n' +
            '  💰 Bench press - 100 kg\n' +
            '  💰 Squat - 145 kg\n' +
            '  💰 5 guitars\n',
    },
    {
      x: 67, y: 74, ch: '$', fg: '#ffaa00',
      name: 'Small Casket',
      desc: 'Inside — old pet projects and notes.',
    },

    /* ── Library ── */
    { x: 85, y: 80, ch: 'π', fg: '#aaaaaa', name: 'Table',  desc: 'Reading table. Here they study operating networks.' },
    { x: 86, y: 80, ch: '¢', fg: '#aaaaaa', name: 'Chair',  desc: 'Scholar\'s creaking chair.' },
    { x: 95, y: 80, ch: 'π', fg: '#aaaaaa', name: 'Table',  desc: 'Table with an open book on C.' },
    { x: 96, y: 80, ch: '¢', fg: '#aaaaaa', name: 'Chair',  desc: 'Chair for evening reading.' },
    {
      x: 90, y: 85, ch: '§', fg: '#00ffff',
      name: 'Tome',
      desc: 'Title: Scholar.\n\n' +
            '📖 Studied: algorithms, Clean Code, networks\n' +
            '📖 In progress: C, Codeforces, system architecture\n' +
            '📖 Want to learn: compilers, operating systems\n',
      link: 'https://github.com/lozhka2281337',
      linkText: '→ Read resume',
    },
    {
      x: 85, y: 88, ch: 'b', fg: '#664422',
      name: 'Bed',
      desc: 'Dwarf\'s bedroom. Here strength is restored after labs and colloquiums.',
    },

    /* ── Throne Room ── */
    {
      x: 130, y: 40, ch: 'Ñ', fg: '#ffff00',
      name: 'Throne',
      desc: 'You ascend the throne. Inscription above the entrance:\n\n' +
            '  "Nikolai, CS Student"\n\n' +
            'Education: FEFU, ПМИ, 2nd year.\n' +
            'Specialization: C/C++, NASM, Python, algorithms.\n' +
            'Achievement: 180+ solved Codeforces tasks.\n' +
            'Hobbies: heavy music, gym, CS.\n',
    },
    { x: 128, y: 36, ch: '*', fg: '#ff4400', name: 'Brazier', desc: 'Warm fire illuminates the vault.' },
    { x: 132, y: 36, ch: '*', fg: '#ff4400', name: 'Brazier', desc: 'Warm fire illuminates the vault.' },

    /* ── Trade Depot: Contacts ── */
    {
      x: 165, y: 55, ch: '╬', fg: '#00ffff',
      name: 'Trade Depot',
      desc: 'The caravan is ready to depart. Contact me:\n\n' +
            '  ✉  email:     zhukovskii.nm@dvfu.ru\n' +
            '  ⌨  GitHub:    github.com/lozhka2281337\n' +
            '  ✈  Telegram:  @poveliteldoti\n',
      link: 'mailto:zhukovskii.nm@dvfu.ru',
      linkText: '→ Send email',
    },
    { x: 160, y: 45, ch: '$', fg: '#ffaa00', name: 'Crate', desc: 'A crate with trade samples.' },
    { x: 170, y: 65, ch: '$', fg: '#ffaa00', name: 'Crate', desc: 'A crate with trade samples.' },
  ],
};
