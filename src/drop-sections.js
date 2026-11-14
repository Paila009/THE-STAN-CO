import './drop-sections.css';

const dropProducts = [
  {
    id: 'rebel-classic',
    name: 'The Original Rebel Classic T-Shirt',
    image: 'rebel-green.webp',
    width: 1200,
    height: 1500,
  },
  {
    id: 'king-of-the-sea',
    name: 'King of the Sea Pendant',
    image: 'sea-pendant.webp',
    width: 1107,
    height: 1650,
  },
];

function productCard(product) {
  return `
    <li class="drop-chapter__card">
      <a class="drop-chapter__product" href="#product/${product.id}" data-product="${product.id}">
        <span class="drop-chapter__product-image">
          <img src="/images/${product.image}" alt="" width="${product.width}" height="${product.height}" loading="lazy" decoding="async">
        </span>
        <span class="drop-chapter__product-name">${product.name}<span aria-hidden="true">↗</span></span>
      </a>
    </li>`;
}

export function mountDropSections() {
  const container = document.querySelector('#drop-sections');
  if (!container) return;

  container.innerHTML = `
    <section class="drop-chapter drop-chapter--upcoming" id="upcoming" aria-labelledby="upcoming-title">
      <div class="drop-chapter__scene">
        <span class="drop-chapter__watermark" aria-hidden="true">Coming soon</span>
        <div class="drop-chapter__media drop-chapter__media--fabric">
          <img src="/images/upcoming-editorial.webp" alt="Cobalt and ivory fabric in motion" width="1100" height="733" loading="lazy" decoding="async">
        </div>
        <header class="drop-chapter__heading">
          <span class="drop-chapter__kicker">Next collection</span>
          <h2 id="upcoming-title">Coming soon</h2>
          <p>Sign up for news about the next drop.</p>
          <a class="drop-chapter__cta" href="#updates">Get drop updates <span aria-hidden="true">↗</span></a>
        </header>
      </div>
    </section>
    <section class="drop-chapter drop-chapter--current" id="oct23ed" aria-labelledby="oct23ed-title">
      <div class="drop-chapter__scene">
        <span class="drop-chapter__watermark" aria-hidden="true">#oct23ed</span>
        <div class="drop-chapter__media drop-chapter__media--rebel">
          <img src="/images/rebel-editorial.webp" alt="Two models wearing forest-green Rebel T-shirts" width="1040" height="1300" loading="lazy" decoding="async">
        </div>
        <header class="drop-chapter__heading">
          <span class="drop-chapter__kicker">Current collection</span>
          <h2 id="oct23ed-title">#oct23ed Drop</h2>
          <a class="drop-chapter__cta" href="#shop">Shop the drop <span aria-hidden="true">↓</span></a>
        </header>
        <ul class="drop-chapter__cards" aria-label="Pieces from the #oct23ed Drop">
          ${dropProducts.map(productCard).join('')}
        </ul>
      </div>
    </section>`;

  if (!('IntersectionObserver' in window)) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const nearby = new Set();
  const scenes = [...container.querySelectorAll('.drop-chapter__scene')];
  let frame;

  function update() {
    frame = undefined;
    if (reducedMotion.matches) return;
    const viewport = window.innerHeight;
    const strength = window.innerWidth < 740 ? .48 : 1;
    const measurements = [...nearby].map(scene => ({ scene, bounds: scene.getBoundingClientRect() }));

    for (const { scene, bounds } of measurements) {
      const travel = Math.min(1, Math.max(0, (viewport - bounds.top) / (viewport + bounds.height)));
      const drift = (travel - .5) * 2 * strength;
      const deckTop = bounds.top + bounds.height * .54;
      const reveal = Math.min(1, Math.max(0, (viewport * .96 - deckTop) / (viewport * .36)));
      const entry = (1 - reveal) ** 2 * strength;

      scene.style.setProperty('--drop-type-drift', `${Math.round(drift * 62)}px`);
      scene.style.setProperty('--drop-image-drift', `${Math.round(drift * -25)}px`);
      scene.style.setProperty('--drop-card-spread', `${Math.round(entry * 132)}px`);
      scene.style.setProperty('--drop-card-entry', `${Math.round(entry * 37)}px`);
      scene.style.setProperty('--drop-card-turn', `${(entry * 31).toFixed(2)}deg`);
      scene.style.setProperty('--drop-card-opacity', (.68 + reveal * .32).toFixed(2));
    }
  }

  function schedule() {
    if (frame === undefined && nearby.size && !reducedMotion.matches) frame = requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (isIntersecting) nearby.add(target);
      else nearby.delete(target);
    }
    schedule();
  }, { rootMargin: '130px 0px' });

  scenes.forEach(scene => observer.observe(scene));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  reducedMotion.addEventListener('change', schedule);
}
