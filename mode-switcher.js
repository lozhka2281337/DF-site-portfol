(() => {
  'use strict';

  const STORAGE_KEY = 'df-site-mode';

  function normalizeMode(mode) {
    return mode === 'classic' ? 'classic' : 'new';
  }

  function readMode() {
    try {
      return normalizeMode(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      return 'new';
    }
  }

  function saveMode(mode) {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      /* noop */
    }
  }

  function refreshButtons(mode) {
    const buttons = document.querySelectorAll('[data-mode-button]');
    buttons.forEach(button => {
      const isActive = button.getAttribute('data-mode-button') === mode;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function applyMode(mode, persist) {
    const nextMode = normalizeMode(mode);
    document.documentElement.setAttribute('data-mode', nextMode);
    refreshButtons(nextMode);
    if (persist) saveMode(nextMode);

    if (nextMode === 'classic' && window.DF && DF.renderer) {
      requestAnimationFrame(() => {
        DF.renderer.resize();
        DF.renderer.markDirty();
      });
    }
  }

  function init() {
    applyMode(readMode(), false);
    document.querySelectorAll('[data-mode-button]').forEach(button => {
      button.addEventListener('click', () => {
        applyMode(button.getAttribute('data-mode-button'), true);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
