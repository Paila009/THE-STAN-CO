const clamp = value => Math.min(1, Math.max(0, value));

function smoothStep(value) {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
}

export function mountShopFan(root) {
  const heading = root?.querySelector('.stan-shop-heading');
  if (!heading || !('IntersectionObserver' in window)) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const abort = new AbortController();
  let visible = false;
  let frame = 0;
  let previousLead;
  let previousSpread;

  function paint(lead, spread) {
    if (lead !== previousLead) {
      root.style.setProperty('--fan-lead', lead);
      previousLead = lead;
    }
    if (spread !== previousSpread) {
      root.style.setProperty('--fan-spread', spread);
      previousSpread = spread;
    }
  }

  function update() {
    frame = 0;
    if (reduced.matches) {
      paint(1, 1);
      return;
    }

    const bounds = root.getBoundingClientRect();
    const pin = parseFloat(getComputedStyle(heading).top) || 0;
    const height = heading.getBoundingClientRect().height;
    const travel = bounds.height - height;
    if (travel <= 0 || bounds.bottom <= pin + height) {
      paint(1, 1);
      return;
    }

    const passed = pin - bounds.top;
    const approach = Math.min(96, height / 4);
    const lead = smoothStep((passed + approach) / (approach + travel * .08));
    const spread = smoothStep((passed - travel * .18) / (travel * .82));
    paint(lead.toFixed(4), spread.toFixed(4));
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  });
  intersection.observe(root);

  const signal = abort.signal;
  window.addEventListener('scroll', () => {
    if (visible) schedule();
  }, { signal, passive: true });
  window.addEventListener('resize', schedule, { signal, passive: true });
  window.addEventListener('hashchange', schedule, { signal });
  reduced.addEventListener('change', schedule, { signal });
  update();

  return () => {
    abort.abort();
    intersection.disconnect();
    cancelAnimationFrame(frame);
    root.style.removeProperty('--fan-lead');
    root.style.removeProperty('--fan-spread');
  };
}
