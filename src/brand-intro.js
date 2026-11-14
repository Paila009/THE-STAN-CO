import './brand-intro.css';

export function mountBrandIntro(screen, { onReveal, onSkip }) {
  if (screen.hidden) return;
  if (window.scrollY > 80) {
    screen.hidden = true;
    return;
  }

  const skipButton = screen.querySelector('[data-intro-skip]');
  const video = screen.querySelector('video');
  const abort = new AbortController();
  const { signal } = abort;
  let timer;

  function rememberIntro() {
    try { localStorage.setItem(screen.dataset.seenKey, '1'); } catch {}
  }

  function close() {
    if (signal.aborted) return;
    abort.abort();
    clearTimeout(timer);
    screen.hidden = true;
    video.pause();
    video.removeAttribute('src');
    video.load();
  }

  function reveal() {
    if (signal.aborted || screen.dataset.phase === 'exit') return;
    clearTimeout(timer);
    rememberIntro();
    screen.dataset.phase = 'exit';
    video.pause();
    onReveal();
    timer = window.setTimeout(() => {
      const moveFocus = document.activeElement === skipButton;
      close();
      if (moveFocus) onSkip();
    }, 520);
  }

  video.addEventListener('playing', () => {
    if (screen.dataset.phase === 'exit') return;
    if (!screen.dataset.phase) {
      screen.dataset.phase = 'video';
      screen.classList.add('has-video');
      rememberIntro();
      clearTimeout(timer);
      // A connection that stalls during playback must still reveal the homepage.
      const duration = Number.isFinite(video.duration) ? video.duration : 8;
      timer = window.setTimeout(reveal, (duration + 3) * 1000);
    }
  }, { signal });
  video.addEventListener('ended', reveal, { signal, once: true });
  video.addEventListener('error', reveal, { signal, once: true });
  skipButton.addEventListener('click', reveal, { signal });
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') reveal();
  }, { signal });
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) close();
  }, { signal, passive: true });
  window.addEventListener('hashchange', () => {
    if (location.hash && location.hash !== '#top') close();
  }, { signal });
  window.addEventListener('pagehide', close, { signal });

  screen.classList.add('is-managed');
  timer = window.setTimeout(reveal, 2600);
  video.muted = true;
  video.src = video.dataset.src;
  video.play().catch(reveal);

  return { active: () => !signal.aborted && screen.dataset.phase !== 'exit', close };
}
