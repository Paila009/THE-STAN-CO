import './brand-intro.css';

export function mountBrandIntro(screen, { heroImage, onReveal, onSkip }) {
  if (screen.hidden) return;
  if (window.scrollY > 80) {
    screen.hidden = true;
    return;
  }

  const skipButton = screen.querySelector('[data-intro-skip]');
  const sculpture = screen.querySelector('.opening-slate__scene');
  const startedAt = performance.now();
  let active = true;
  let disposeScene;
  let revealTimer;
  let exitTimer;
  let closeTimer;
  let sceneModule;
  const abort = new AbortController();

  function close() {
    if (!active) return;
    active = false;
    clearTimeout(revealTimer);
    clearTimeout(exitTimer);
    clearTimeout(closeTimer);
    abort.abort();
    disposeScene?.();
    screen.hidden = true;
  }

  function skip(moveFocus = false) {
    if (!active) return;
    close();
    onSkip(moveFocus);
  }

  function reveal() {
    if (!active || screen.dataset.phase) return;
    clearTimeout(revealTimer);
    screen.dataset.phase = 'brand';
    disposeScene = sceneModule?.mountBrandScene(sculpture);
    exitTimer = setTimeout(() => {
      screen.dataset.phase = 'exit';
      onReveal();
      closeTimer = setTimeout(() => {
        const moveFocus = document.activeElement === skipButton;
        close();
        if (moveFocus) onSkip(true);
      }, 520);
    }, 1460);
  }

  const signal = abort.signal;
  skipButton.addEventListener('click', () => skip(true), { signal });
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') skip(document.activeElement === skipButton);
  }, { signal });
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) skip();
  }, { signal, passive: true });
  window.addEventListener('hashchange', () => {
    if (location.hash && location.hash !== '#top') skip();
  }, { signal });
  window.addEventListener('pagehide', close, { signal });

  revealTimer = setTimeout(reveal, 900);

  Promise.allSettled([
    heroImage.decode(),
    import('./brand-scene.js').then(module => {
      if (active) sceneModule = module;
    }),
  ]).then(() => {
    if (!active || screen.dataset.phase) return;
    clearTimeout(revealTimer);
    revealTimer = setTimeout(reveal, Math.max(0, 450 - performance.now() + startedAt));
  });

  return { active: () => active, skip };
}

