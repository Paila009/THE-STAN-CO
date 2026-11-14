import './chapters.css';
import { collectionPortrait, collections } from './collections.js';

const artDirection = {
  'october-23rd-drop': {
    legacyId: 'rebelwood',
    accent: '#ffb47e',
    ink: '#210e0b',
    glow: '#823c21',
    alternate: '/images/model-rebel-black.webp',
    alt: 'Fashion model wearing the forest green Rebel T-shirt',
    alternateAlt: 'Fashion model wearing the black Rebel T-shirt',
    portraitSize: [896, 1120],
  },
  'frame-shift-studio': {
    accent: '#ffd18d',
    ink: '#14151e',
    glow: '#57402e',
    alt: 'Model in a washed black short-sleeve tee with an amber print',
    portraitSize: [747, 1120],
  },
  'allu-arjun': {
    id: 'bhaai',
    accent: '#f4b69a',
    ink: '#200f19',
    glow: '#693742',
    alt: 'Fashion model in a cocoa-brown workwear jacket',
    portraitSize: [896, 1120],
  },
  'mahesh-babu': {
    accent: '#a3d8ff',
    ink: '#0b1628',
    glow: '#254c79',
    alt: 'Fashion model in a navy jacket and ivory tee',
    portraitSize: [896, 1120],
  },
  'ram-charan': {
    accent: '#ffa97e',
    ink: '#201008',
    glow: '#893b23',
    alt: 'Fashion model in a coral tee and gray track jacket',
    portraitSize: [896, 1120],
  },
  'after-hours': {
    legacyId: 'jr-ntr',
    accent: '#bbccff',
    ink: '#0c111d',
    glow: '#243e69',
    alt: 'Model in a dark pullover hoodie with the hood down',
    portraitSize: [747, 1120],
  },
  'pawan-kalyan': {
    accent: '#fcc0d6',
    ink: '#23121c',
    glow: '#723449',
    alt: 'Fashion model in a charcoal hoodie',
    portraitSize: [896, 1120],
  },
  'off-grid': {
    legacyId: 'nani',
    accent: '#e7cce6',
    ink: '#18151b',
    glow: '#514353',
    alt: 'Model in a stone-colored zip hoodie with the hood up',
    portraitSize: [747, 1120],
  },
};

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function productCard(product, index, products) {
  const hoodie = product.garment === 'hoodie';
  const garmentName = hoodie ? 'hoodie' : 'tee';
  const nameHasGarment = product.name.toLowerCase().endsWith(' ' + garmentName);
  const colours = product.variants ? `${product.variants.length} colours` : product.color;
  const price = money.format(product.price / 100);
  const label = product.image
    ? `${product.name}, ${colours}, ${price}`
    : nameHasGarment ? product.name : `${product.name} ${garmentName}`;
  const photos = product.image
    ? `<img src="${product.image}" alt="" loading="lazy" decoding="async">`
    : `<img src="/images/${product.slug}-back.webp" alt="" width="780" height="900" loading="lazy" decoding="async">
       <img class="actor-chapter__garment-front" src="/images/${product.slug}-front.webp" alt="" width="780" height="900" loading="lazy" decoding="async">`;
  const side = products.length === 1 || index > 0 ? 1 : -1;

  return `
    <li class="actor-chapter__card" style="--card-side:${side}">
      <a href="#product/${product.slug}" class="actor-chapter__product" data-product="${product.slug}" aria-label="View ${label}">
        <span class="actor-chapter__garment${product.image ? ' actor-chapter__garment--photo' : ''}">${photos}</span>
        <span class="actor-chapter__card-name">${product.name}</span>
        <span class="actor-chapter__card-details"><span>${colours} · ${price}</span><span aria-hidden="true">↗</span></span>
      </a>
    </li>`;
}

function chapterMarkup(collection, index) {
  const direction = artDirection[collection.slug];
  const name = collection.name;
  const id = direction.id ?? collection.slug;
  const portrait = collectionPortrait(collection.slug);
  const alt = direction.alt ?? name + ' collection portrait';
  const [portraitWidth, portraitHeight] = direction.portraitSize ?? [1142, 1402];
  const nextCollection = collections[index + 1];
  const next = nextCollection && artDirection[nextCollection.slug];
  const nextId = next?.id ?? nextCollection?.slug ?? 'shop';
  const nextLabel = nextCollection?.name ?? 'All clothing';
  const isOctoberDrop = collection.slug === 'october-23rd-drop';
  const featured = isOctoberDrop || collection.slug === 'allu-arjun' ? ' actor-chapter--featured' : '';
  const single = collection.products.length === 1;
  const garmentLabel = collection.products[0].garment === 'hoodie' ? 'hoodie' : 'tee';
  const cardLabel = isOctoberDrop ? 'products' : garmentLabel + (single ? '' : 's');

  return `
    <article class="actor-chapter${featured}" id="${id}" aria-labelledby="${id}-title" data-actor-chapter="${collection.slug}" style="--actor-ink:${direction.ink};--actor-glow:${direction.glow};--actor-accent:${direction.accent}">
      ${direction.legacyId ? `<span class="actor-chapter__legacy-anchor" id="${direction.legacyId}" aria-hidden="true"></span>` : ''}
      <div class="actor-chapter__scene">
        <div class="actor-chapter__field" aria-hidden="true"></div>
        <div class="actor-chapter__watermark" aria-hidden="true">${name}</div>
        <div class="actor-chapter__media">
          <img class="actor-chapter__portrait is-active" src="${portrait}" alt="${alt}" width="${portraitWidth}" height="${portraitHeight}" loading="lazy" decoding="async">
          ${direction.alternate ? `<img class="actor-chapter__portrait" src="${direction.alternate}" alt="${direction.alternateAlt}" width="${portraitWidth}" height="${portraitHeight}" loading="lazy" decoding="async" aria-hidden="true">` : ''}
        </div>
        <header class="actor-chapter__heading" data-chapter-heading>
          <p>The Stan Co.</p>
          <h2 id="${id}-title"><span>${name}</span></h2>
          <p class="actor-chapter__description">${collection.description}</p>
        </header>
        <ul class="actor-chapter__cards${single ? ' actor-chapter__cards--single' : ''}" data-chapter-cards aria-label="${name} ${cardLabel}">
          ${collection.products.map(productCard).join('')}
        </ul>
        <footer class="actor-chapter__footer">
          ${direction.alternate ? `
            <div class="actor-chapter__looks" role="group" aria-label="Rebel T-shirt colour on model">
              <button type="button" data-chapter-look="0" aria-pressed="true">Green T-shirt</button>
              <button type="button" data-chapter-look="1" aria-pressed="false">Black T-shirt</button>
            </div>
          ` : '<span class="actor-chapter__image-note">AI-generated model artwork</span>'}
          <a class="actor-chapter__next" href="#${nextId}">${nextLabel}<span aria-hidden="true">↓</span></a>
        </footer>
      </div>
    </article>`;
}

const clamp = (value, lower, upper) => Math.min(upper, Math.max(lower, value));
const smooth = (value) => value * value * (3 - 2 * value);
const pixel = (value) => Math.round(value) + 'px';
const angle = (value) => value.toFixed(2) + 'deg';

function setupLookSwitch(chapter) {
  const buttons = [...chapter.querySelectorAll('[data-chapter-look]')];
  if (!buttons.length) return;
  const portraits = [...chapter.querySelectorAll('.actor-chapter__portrait')];
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const selected = Number(button.dataset.chapterLook);
      buttons.forEach((item, index) => item.setAttribute('aria-pressed', String(index === selected)));
      portraits.forEach((image, index) => {
        image.classList.toggle('is-active', index === selected);
        image.setAttribute('aria-hidden', String(index !== selected));
      });
    });
  }
}

function setupCardTilt(container, motion) {
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  for (const link of container.querySelectorAll('.actor-chapter__product')) {
    function reset() {
      link.style.removeProperty('--card-tilt-x');
      link.style.removeProperty('--card-tilt-y');
    }

    link.addEventListener('pointermove', (event) => {
      if (!finePointer.matches || motion.matches || event.pointerType === 'touch') return;
      const bounds = link.parentElement.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
      const y = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
      link.style.setProperty('--card-tilt-x', angle((.5 - y) * 15));
      link.style.setProperty('--card-tilt-y', angle((x - .5) * 20));
    });
    link.addEventListener('pointerleave', reset);
    link.addEventListener('pointercancel', reset);
    link.addEventListener('blur', reset);
  }
}

export function mountChapters(container) {
  if (!container) return;
  container.innerHTML = collections.map(chapterMarkup).join('');
  const chapters = [...container.querySelectorAll('[data-actor-chapter]')];
  for (const chapter of chapters) setupLookSwitch(chapter);

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  setupCardTilt(container, motion);
  if (!('IntersectionObserver' in window)) return;
  const sections = new Map(chapters.map((chapter, index) => [chapter, {
    chapter,
    deck: chapter.querySelector('[data-chapter-cards]'),
    heading: chapter.querySelector('[data-chapter-heading]'),
    direction: index % 2 ? 1 : -1,
  }]));
  const nearby = new Set();
  let frame = 0;

  function update() {
    frame = 0;
    if (motion.matches) return;
    const { innerHeight: viewport, innerWidth: width } = window;
    const mobile = width < 761;
    const spread = mobile ? Math.min(56, width * .13) : Math.min(375, width * .24);
    const measurements = [...nearby].map(({ chapter, deck, heading, direction }) => ({
      style: chapter.style,
      bounds: chapter.getBoundingClientRect(),
      deckTop: deck.getBoundingClientRect().top,
      headingTop: heading.getBoundingClientRect().top,
      direction,
    }));

    for (const { style, bounds, deckTop, headingTop, direction } of measurements) {
      const travel = clamp((viewport - bounds.top) / (viewport + bounds.height), 0, 1);
      const parallax = (travel - .5) * 2;
      const titleOpen = smooth(clamp((viewport * .96 - headingTop) / (viewport * .38), 0, 1));
      const entry = clamp((viewport * .98 - deckTop) / (viewport * .48), 0, 1);
      const split = 1 - smooth(entry);
      const stagger = Math.sin(entry * Math.PI);
      const cardDrift = parallax * (mobile ? 9 : 24);

      style.setProperty('--chapter-title-mask', ((1 - titleOpen) * (mobile ? 46 : 80)).toFixed(1) + '%');
      style.setProperty('--chapter-title-y', pixel((1 - titleOpen) * (mobile ? 12 : 37)));
      style.setProperty('--chapter-title-tilt', angle((1 - titleOpen) * (mobile ? -7 : -13)));
      style.setProperty('--chapter-field-y', pixel(parallax * (mobile ? -13 : -42)));
      style.setProperty('--chapter-watermark-y', pixel(parallax * (mobile ? 25 : 88)));
      style.setProperty('--chapter-watermark-x', pixel(parallax * direction * (mobile ? 14 : 57)));
      style.setProperty('--chapter-portrait-y', pixel(parallax * (mobile ? -20 : -68)));
      style.setProperty('--chapter-portrait-x', pixel(parallax * direction * (mobile ? 9 : 36)));
      style.setProperty('--chapter-portrait-scale', (1 + (1 - Math.abs(parallax)) * (mobile ? .018 : .038)).toFixed(3));
      style.setProperty('--chapter-spread', pixel(split * spread));
      style.setProperty('--chapter-drop', pixel(split * (mobile ? 29 : 94)));
      style.setProperty('--chapter-depth', pixel(split * (mobile ? -66 : -218)));
      style.setProperty('--chapter-yaw', angle(split * (mobile ? 16 : 47)));
      style.setProperty('--chapter-card-drift', pixel(cardDrift));
      style.setProperty('--chapter-card-stagger', pixel(stagger * (mobile ? 12 : 43)));
      style.setProperty('--chapter-card-opacity', (.63 + .37 * smooth(entry)).toFixed(2));
    }
  }

  function schedule() {
    if (!frame && nearby.size && !motion.matches) frame = requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const section = sections.get(entry.target);
      if (entry.isIntersecting) nearby.add(section);
      else nearby.delete(section);
    }
    schedule();
  }, { rootMargin: '160px 0px' });

  for (const chapter of chapters) observer.observe(chapter);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  motion.addEventListener('change', () => {
    if (motion.matches) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    } else {
      schedule();
    }
  });
}

