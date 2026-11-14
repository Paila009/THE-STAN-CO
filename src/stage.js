import { collectionPortrait, collections, teeTypes } from './collections.js';
import './hero-strip.css';
import { mountBrandIntro } from './brand-intro.js';

const chapterId = (slug) => slug === 'allu-arjun' ? 'bhaai' : slug;

export function mountBrowse(section) {
  const modes = section.querySelectorAll('[data-browse-mode]');
  const view = section.querySelector('[data-strip-view]');
  const viewport = view.querySelector('[data-strip-viewport]');
  const track = viewport.querySelector('[data-strip-track]');
  const motion = section.querySelector('[data-strip-motion]');
  const types = section.querySelector('#browse-tee-types');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = matchMedia('(hover: hover)');
  let visible = false;
  let paused = false;
  let hovered = false;
  let inputTimer = 0;
  let frame = 0;
  let lastTime;
  let position = 0;
  let groupWidth = 0;

  function collectionItem({ name, slug }, duplicate = false) {
    const destination = chapterId(slug);
    const opener = duplicate ? `<span data-strip-target="${destination}"` : `<a href="#${destination}"`;
    const closer = duplicate ? '</span>' : '</a>';
    return `<div class="hero-strip__item">
      ${opener} class="hero-strip__link">
        <img class="hero-strip__portrait" src="${collectionPortrait(slug)}" alt="" loading="lazy" decoding="async">
        <span class="hero-strip__name" data-text="${name}">${name}</span>
      ${closer}
      <span class="hero-strip__separator" aria-hidden="true">✦</span>
    </div>`;
  }

  track.innerHTML = `<div class="hero-strip__group">${collections.map((item) => collectionItem(item)).join('')}</div>
    <div class="hero-strip__group" aria-hidden="true">${collections.map((item) => collectionItem(item, true)).join('')}</div>`;
  const firstGroup = track.firstElementChild;
  types.querySelector('[data-browse-track]').innerHTML = teeTypes.map((type) => `
    <a class="browse-card" href="#shop" data-tee-type="${type.slug}">
      <div class="browse-visual"><img src="${type.image}" alt="" loading="lazy" decoding="async"></div>
      <span class="browse-label"><strong>${type.name}</strong><span aria-hidden="true">↗</span></span>
    </a>`).join('');

  function advance(now) {
    if (lastTime !== undefined && groupWidth > 0) {
      const delta = Math.min(now - lastTime, 42);
      position = (position + delta * .058) % groupWidth;
      viewport.scrollLeft = position;
    }
    lastTime = now;
    frame = requestAnimationFrame(advance);
  }

  function sync() {
    const enabled = !reduced.matches;
    viewport.classList.toggle('has-loop', enabled);
    motion.hidden = !enabled || view.hidden;
    motion.textContent = paused ? '▶' : 'Ⅱ';
    const label = paused ? 'Play collection strip' : 'Pause collection strip';
    motion.setAttribute('aria-label', label);
    motion.title = label;
    const moving = enabled && visible && !view.hidden && !document.hidden && !paused
      && !hovered && !inputTimer && !viewport.contains(document.activeElement);
    viewport.classList.toggle('is-moving', moving);
    if (!moving && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (moving && !frame) {
      position = viewport.scrollLeft;
      lastTime = undefined;
      frame = requestAnimationFrame(advance);
    }
  }

  function pauseForInput() {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(() => {
      inputTimer = 0;
      sync();
    }, 1800);
    sync();
  }

  modes.forEach((button) => button.addEventListener('click', () => {
    const showTypes = button.dataset.browseMode === 'types';
    modes.forEach((mode) => mode.setAttribute('aria-pressed', String(mode === button)));
    view.hidden = showTypes;
    types.hidden = !showTypes;
    sync();
  }));
  motion.addEventListener('click', () => {
    paused = !paused;
    sync();
  });
  viewport.addEventListener('pointerenter', (event) => {
    if (!canHover.matches || event.pointerType !== 'mouse') return;
    hovered = true;
    sync();
  });
  viewport.addEventListener('pointerleave', () => {
    hovered = false;
    sync();
  });
  viewport.addEventListener('pointerdown', pauseForInput, { passive: true });
  viewport.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') pauseForInput();
  }, { passive: true });
  viewport.addEventListener('wheel', pauseForInput, { passive: true });
  viewport.addEventListener('focusin', sync);
  viewport.addEventListener('focusout', () => queueMicrotask(sync));
  viewport.addEventListener('click', (event) => {
    const duplicate = event.target.closest('[data-strip-target]');
    if (duplicate) window.location.hash = duplicate.dataset.stripTarget;
  });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  new ResizeObserver(() => {
    groupWidth = firstGroup.getBoundingClientRect().width;
  }).observe(firstGroup);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(viewport);
  sync();
}

export function mountOpening(hero) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const progress = document.querySelector('.page-progress');
  const lookbook = hero.querySelector('.premiere-lookbook');
  const motion = hero.querySelector('[data-hero-motion]');
  let visible = true;
  let paused = false;
  let scrollFrame = 0;
  let openingTimeout;

  const intro = mountBrandIntro(document.querySelector('.opening-slate'), {
    heroImage: hero.querySelector('.premiere-feature img'),
    onReveal() {
      hero.classList.add('is-opening');
      openingTimeout = window.setTimeout(() => hero.classList.remove('is-opening'), 1550);
    },
    onSkip(moveFocus) {
      if (moveFocus) hero.querySelector('h1').focus({ preventScroll: true });
    },
  });

  function finishOpening() {
    intro?.skip();
    clearTimeout(openingTimeout);
    hero.classList.remove('is-opening');
  }

  function resetPointer() {
    for (const name of ['x', 'y', 'angle']) hero.style.removeProperty('--hero-pointer-' + name);
  }

  function syncMotion() {
    hero.classList.toggle('has-motion', !paused && !reduced.matches);
    hero.classList.toggle('is-in-view', visible && !document.hidden);
    motion.hidden = reduced.matches;
    if (paused || reduced.matches || !visible || document.hidden) resetPointer();
  }

  motion.addEventListener('click', () => {
    paused = !paused;
    motion.textContent = paused ? 'Play animation' : 'Pause animation';
    syncMotion();
    scheduleScroll();
  });
  lookbook.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || event.pointerType === 'touch' || reduced.matches || paused || intro?.active()) return;
    const bounds = lookbook.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    hero.style.setProperty('--hero-pointer-x', `${x * 30}px`);
    hero.style.setProperty('--hero-pointer-y', `${y * 20}px`);
    hero.style.setProperty('--hero-pointer-angle', `${x * 4}deg`);
  }, { passive: true });
  lookbook.addEventListener('pointerleave', resetPointer);
  lookbook.addEventListener('pointercancel', resetPointer);
  finePointer.addEventListener('change', resetPointer);
  document.addEventListener('visibilitychange', syncMotion);

  document.querySelector('.skip-link').addEventListener('focus', finishOpening);
  document.querySelector('.masthead').addEventListener('focusin', finishOpening);
  hero.addEventListener('focusin', finishOpening);
  function updateScroll() {
    scrollFrame = 0;
    if (reduced.matches) return;
    const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.setProperty('--page-read', Math.min(1, window.scrollY / maximum));
    if (!visible || paused) return;
    const movement = Math.max(0, Math.min(1, -hero.getBoundingClientRect().top / hero.offsetHeight));
    hero.style.setProperty('--garment-rise', `${movement * -22}px`);
  }

  function scheduleScroll() {
    if (!scrollFrame && !reduced.matches) scrollFrame = requestAnimationFrame(updateScroll);
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncMotion();
    scheduleScroll();
  }).observe(hero);
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });

  reduced.addEventListener('change', (event) => {
    if (event.matches) finishOpening();
    syncMotion();
    scheduleScroll();
  });
  syncMotion();
  scheduleScroll();
}
