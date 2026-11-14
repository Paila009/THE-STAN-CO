export function mountMotion() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('#top');
  const progress = document.querySelector('.page-progress');
  const shutter = hero.querySelector('.premiere-shutter');
  const visual = hero.querySelector('[data-tilt]');
  let frame = 0;
  let visible = true;

  const finishOpening = () => hero.classList.remove('is-opening');
  if ((!location.hash || location.hash === '#top') && !location.search && !reduced.matches && scrollY < 80) {
    hero.classList.add('is-opening');
    setTimeout(finishOpening, 2100);
  }
  shutter.addEventListener('animationend', event => {
    if (event.target === shutter && event.animationName === 'premiere-opening') finishOpening();
  });
  function updateScroll() {
    frame = 0;
    if (reduced.matches) return;
    const maximum = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progress.style.setProperty('--page-read', Math.min(1, scrollY / maximum));
    if (!visible) return;
    const movement = Math.max(0, Math.min(1, -hero.getBoundingClientRect().top / hero.offsetHeight));
    const amplitude = innerWidth < 681 ? .45 : 1;
    hero.style.setProperty('--title-slide', `${-movement * 58 * amplitude}px`);
    hero.style.setProperty('--portrait-slide', `${movement * 78 * amplitude}px`);
    hero.style.setProperty('--floor-slide', `${-movement * 80 * amplitude}px`);
  }
  function scheduleScroll() {
    if (!frame && !reduced.matches) frame = requestAnimationFrame(updateScroll);
  }
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    hero.classList.toggle('is-in-view', visible);
    scheduleScroll();
  }).observe(hero);
  addEventListener('scroll', scheduleScroll, { passive: true });
  addEventListener('resize', scheduleScroll, { passive: true });
  reduced.addEventListener('change', () => {
    finishOpening();
    if (reduced.matches) {
      visual.style.removeProperty('--tilt-x');
      visual.style.removeProperty('--tilt-y');
    }
    scheduleScroll();
  });
  scheduleScroll();

  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    visual.addEventListener('pointermove', event => {
      if (reduced.matches) return;
      const bounds = visual.getBoundingClientRect();
      visual.style.setProperty('--tilt-x', `${(event.clientX - bounds.left - bounds.width / 2) / bounds.width * 26}px`);
      visual.style.setProperty('--tilt-y', `${(event.clientY - bounds.top - bounds.height / 2) / bounds.height * 18}px`);
    });
    visual.addEventListener('pointerleave', () => {
      visual.style.removeProperty('--tilt-x');
      visual.style.removeProperty('--tilt-y');
    });
  }

  mountStrip(reduced);
}

function mountStrip(reduced) {
  const viewport = document.querySelector('.hero-strip__viewport');
  const track = viewport.querySelector('.hero-strip__track');
  const group = track.firstElementChild;
  const pause = document.querySelector('[data-strip-motion]');
  const copy = group.cloneNode(true);
  copy.setAttribute('aria-hidden', 'true');
  copy.querySelectorAll('a').forEach(link => { link.tabIndex = -1; });
  track.append(copy);

  let visible = false;
  let hovered = false;
  let paused = false;
  let timeframe = 0;
  let last = 0;
  let distance = 0;
  const shouldMove = () => visible && !hovered && !paused && !reduced.matches && !viewport.contains(document.activeElement);
  function tick(now) {
    timeframe = 0;
    if (!shouldMove()) return;
    if (last) {
      const width = group.offsetWidth;
      distance = (distance + Math.min(now - last, 40) * .038) % width;
      viewport.scrollLeft = distance;
    }
    last = now;
    timeframe = requestAnimationFrame(tick);
  }
  function sync() {
    track.style.setProperty('--group-width', group.offsetWidth + 'px');
    viewport.classList.toggle('has-loop', !reduced.matches);
    viewport.classList.toggle('is-moving', shouldMove());
    pause.hidden = reduced.matches;
    pause.textContent = paused ? '▶' : 'Ⅱ';
    pause.setAttribute('aria-label', paused ? 'Play collection strip' : 'Pause collection strip');
    if (shouldMove() && !timeframe) {
      last = 0;
      distance = viewport.scrollLeft % group.offsetWidth;
      timeframe = requestAnimationFrame(tick);
    } else if (!shouldMove() && timeframe) {
      cancelAnimationFrame(timeframe);
      timeframe = 0;
    }
  }
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(viewport);
  viewport.addEventListener('pointerenter', () => { hovered = true; sync(); });
  viewport.addEventListener('pointerleave', () => { hovered = false; sync(); });
  viewport.addEventListener('focusin', sync);
  viewport.addEventListener('focusout', () => queueMicrotask(sync));
  pause.addEventListener('click', () => { paused = !paused; sync(); });
  reduced.addEventListener('change', sync);
  new ResizeObserver(sync).observe(group);
  sync();
}
