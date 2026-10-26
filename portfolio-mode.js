(() => {
  'use strict';

  const logEl = document.getElementById('fortress-log');
  if (!logEl) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const lines = [
    { tag: 'LOAD', text: 'Skills ledger synchronized.' },
    { tag: 'SCAN', text: 'Project cards ready for keyboard focus.' },
    { tag: 'SYNC', text: 'Trade Depot contacts verified.' },
    { tag: 'INFO', text: 'DF Mode remains available in the switcher.' },
    { tag: 'READY', text: 'Fortress navigation route is clear.' }
  ];

  let i = 0;
  setInterval(() => {
    const line = lines[i % lines.length];
    const entry = document.createElement('li');
    entry.innerHTML = `<span class="log-prefix">[${line.tag}]</span> ${line.text}`;
    logEl.appendChild(entry);
    while (logEl.children.length > 6) logEl.removeChild(logEl.firstElementChild);
    i++;
  }, 2200);
})();
