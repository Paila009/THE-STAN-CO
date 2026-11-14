import './hero-strip.css';

const stripItems = [
  { name: '#oct23ed Drop', href: '#oct23ed', image: '/images/rebel-model.webp' },
  { name: 'Graphic Tees', href: '#shop', type: 'graphic', image: '/images/hero-graphic-tee.webp' },
  { name: 'Accessories', href: '#accessories', image: '/images/king-of-the-sea-pendant.webp' },
  { name: 'Coming Soon', href: '#coming-soon', image: '/images/static-zip-hoodie-front.webp' },
];
const browseStyles = [
  { name: 'Graphic Tees', href: '#shop', type: 'graphic', image: '/images/rebel-tee-black.webp' },
  { name: 'Pullover Hoodies', href: '#shop', collection: 'after-hours', image: '/images/night-shift-hoodie-back.webp' },
  { name: 'Zip Hoodies', href: '#shop', collection: 'off-grid', image: '/images/static-zip-hoodie-front.webp' },
  { name: 'Accessories', href: '#shop', type: 'accessory', image: '/images/king-of-the-sea-pendant.webp' },
];

const shopFilter = ({ type, collection }) => type ? ` data-tee-type="${type}"` : collection ? ` data-collection="${collection}"` : '';

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

  function collectionItem(item, duplicate = false) {
    return `<div class="hero-strip__item">
      <a href="${item.href}" class="hero-strip__link"${shopFilter(item)}${duplicate ? ' tabindex="-1"' : ''}>
        <img class="hero-strip__portrait" src="${item.image}" alt="" loading="lazy" decoding="async">
        <span class="hero-strip__name" data-text="${item.name}">${item.name}</span>
      </a>
      <span class="hero-strip__separator" aria-hidden="true">✦</span>
    </div>`;
  }

  track.innerHTML = `<div class="hero-strip__group">${stripItems.map((item) => collectionItem(item)).join('')}</div>
    <div class="hero-strip__group" aria-hidden="true">${stripItems.map((item) => collectionItem(item, true)).join('')}</div>`;
  const firstGroup = track.firstElementChild;
  types.querySelector('[data-browse-track]').innerHTML = browseStyles.map((type) => `
    <a class="browse-card" href="${type.href}"${shopFilter(type)}>
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
  const progress = document.querySelector('.page-progress');
  const slate = document.querySelector('.opening-slate');
  const startsAtOpening = !location.hash || location.hash === '#top';
  let visible = true;
  let scrollFrame = 0;
  let openingTimeout;

  function finishOpening() {
    clearTimeout(openingTimeout);
    hero.classList.remove('is-opening');
    slate.hidden = true;
  }

  if (startsAtOpening && !reduced.matches && window.scrollY < 80) {
    slate.hidden = false;
    hero.classList.add('is-opening');
    openingTimeout = window.setTimeout(finishOpening, 1720);
  }

  slate.addEventListener('animationend', (event) => {
    if (event.target === slate) slate.hidden = true;
  });
  document.querySelector('.skip-link').addEventListener('focus', finishOpening);
  document.querySelector('.masthead').addEventListener('focusin', finishOpening);
  hero.addEventListener('focusin', finishOpening);
  function updateScroll() {
    scrollFrame = 0;
    if (reduced.matches) return;
    const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.setProperty('--page-read', Math.min(1, window.scrollY / maximum));
    if (!visible) return;
    const movement = Math.max(0, Math.min(1, -hero.getBoundingClientRect().top / hero.offsetHeight));
    hero.style.setProperty('--garment-rise', `${movement * -22}px`);
  }

  function scheduleScroll() {
    if (!scrollFrame && !reduced.matches) scrollFrame = requestAnimationFrame(updateScroll);
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    hero.classList.toggle('is-in-view', visible);
    scheduleScroll();
  }).observe(hero);
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });

  reduced.addEventListener('change', (event) => {
    if (event.matches) finishOpening();
    scheduleScroll();
  });
  scheduleScroll();
}
