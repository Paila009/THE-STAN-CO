export function upcomingGarment({ garment, slug }) {
  if (garment !== 'hoodie') return '/images/upcoming-tee.webp';
  return slug === 'static-zip-hoodie' ? '/images/upcoming-zip-hoodie.webp' : '/images/upcoming-pullover.webp';
}

export const teeTypes = [
  {
    slug: 'graphic',
    name: 'Graphic tees',
    image: upcomingGarment({}),
    description: 'Illustrated motifs and large back prints.',
  },
  {
    slug: 'typography',
    name: 'Typography tees',
    image: '/images/rebel-tee-green.webp',
    description: 'Oversized lettering and bold titles.',
  },
  {
    slug: 'geometric',
    name: 'Geometric tees',
    image: upcomingGarment({}),
    description: 'Grids, rings and repeating forms.',
  },
  {
    slug: 'hoodie',
    name: 'Hoodies',
    image: upcomingGarment({ garment: 'hoodie' }),
    description: 'Oversized pullovers and full-zip hoodies.',
  },
].map(type => ({ ...type, id: type.slug }));

const collectionDetails = [
  {
    slug: 'october-23rd-drop',
    name: 'October 23rd Drop',
    showChapter: true,
    comingSoon: false,
    description: 'The Original Rebel Classic T-shirt and the King of the Sea pendant.',
    items: [
      {
        slug: 'original-rebel', garment: 'tee', teeType: 'typography', name: 'The Original Rebel Classic T-shirt',
        price: 59900,
        description: 'A classic crew-neck T-shirt with a small rebel print on the chest.',
        variants: [
          { slug: 'original-rebel', color: 'Forest green', hex: '#103729', image: '/images/rebel-tee-green.webp', modelImage: '/images/model-rebel-forest-green.webp' },
          { slug: 'original-rebel-black', color: 'Black', hex: '#222222', image: '/images/rebel-tee-black.webp', modelImage: '/images/model-rebel-black.webp' },
        ],
      },
      {
        slug: 'king-of-the-sea-pendant', garment: 'accessory', name: 'King of the Sea Pendant',
        color: 'Natural shell', hex: '#e3c59d', image: '/images/king-of-the-sea-pendant.webp',
        price: 19900,
        description: 'A cream and amber shell pendant on a rust-and-black twisted cord.',
      },
    ],
  },
  {
    slug: 'new-drop-incoming',
    name: 'New Drop Incoming',
    showChapter: true,
    description: 'Coming soon',
    items: [
      {
        slug: 'frame-district-tee', garment: 'tee', teeType: 'geometric', name: 'Unreleased Tee', color: 'Charcoal', hex: '#323334',
        price: 129900, stock: [2, 6, 8, 4, 2],
        description: 'Amber and cobalt crosshairs frame an exposure grid on the back, with a small amber viewfinder on the chest.',
      },
    ],
  },
  {
    slug: 'allu-arjun',
    name: 'Grain & Grit',
    description: 'Woodgrain studies and racing type.',
    items: [
      {
        slug: 'red-sandal', teeType: 'geometric', name: 'Grain Study', color: 'Deep olive', hex: '#40483b',
        price: 129900, stock: [2, 7, 8, 4, 2],
        description: 'Mint and cream contours trace sandalwood growth rings on deep olive.',
      },
      {
        slug: 'style-code', teeType: 'typography', name: 'Track Type', color: 'Graphite', hex: '#45484a',
        price: 129900, stock: [2, 5, 7, 4, 1],
        description: 'Lime lettering and a purple racing grid cut across the graphite back.',
      },
    ],
  },
  {
    slug: 'mahesh-babu',
    name: 'Motion Archive',
    description: 'Viewfinder graphics and camera aperture studies.',
    items: [
      {
        slug: 'one-take', teeType: 'geometric', name: 'Frame Shift', color: 'Cobalt', hex: '#2547af',
        price: 129900, stock: [2, 6, 8, 5, 2],
        description: 'Mint and coral frame lines shift across a cobalt back print.',
      },
      {
        slug: 'silver-screen', teeType: 'geometric', name: 'Silver Aperture', color: 'Bone', hex: '#e4ddcb',
        price: 129900, stock: [3, 6, 6, 4, 1],
        description: 'A silver-blue aperture sits on a blue film grid against bone.',
      },
    ],
  },
  {
    slug: 'ram-charan',
    name: 'Heatwave Press',
    description: 'Heat maps and diagrams drawn from dance steps.',
    items: [
      {
        slug: 'fireline', teeType: 'graphic', name: 'Thermal Field', color: 'Washed black', hex: '#353535',
        price: 129900, stock: [2, 6, 8, 4, 2],
        description: 'Coral and gold thermal contours stand out on washed black.',
      },
      {
        slug: 'rhythm-club', teeType: 'graphic', name: 'Step Diagram', color: 'Clay', hex: '#a56854',
        price: 129900, stock: [2, 5, 7, 3, 2],
        description: 'Pale cyan and cream footprints trace dance steps across clay.',
      },
    ],
  },
  {
    slug: 'after-hours',
    name: 'After Hours',
    description: 'Oversized pullovers with cobalt orbital prints.',
    items: [
      {
        slug: 'night-shift-hoodie', garment: 'hoodie', teeType: 'hoodie', name: 'Night Shift Hoodie', color: 'Washed black', hex: '#353535',
        price: 189900, stock: [2, 5, 7, 4, 2],
        description: 'An oversized washed-black pullover with a cobalt orbital print on the back and a matching chest mark.',
      },
    ],
  },
  {
    slug: 'pawan-kalyan',
    name: 'Signal Works',
    description: 'Radio signals and skyline prints.',
    items: [
      {
        slug: 'power-signal', teeType: 'typography', name: 'Signal Stack', color: 'Washed black', hex: '#353535',
        price: 129900, stock: [3, 7, 9, 5, 2],
        description: 'Electric lavender and lime radio signals stack up on washed black.',
      },
      {
        slug: 'city-frequency', teeType: 'graphic', name: 'City Wave', color: 'Off-white', hex: '#ede8db',
        price: 129900, stock: [2, 5, 7, 4, 2],
        description: 'Royal blue and rust waves trace a city skyline on off-white.',
      },
    ],
  },
  {
    slug: 'off-grid',
    name: 'Off Grid',
    description: 'Full-zip hoodies with interference grid graphics.',
    items: [
      {
        slug: 'static-zip-hoodie', garment: 'hoodie', teeType: 'hoodie', name: 'Static Zip Hoodie', color: 'Stone heather', hex: '#a6a095',
        price: 209900, stock: [2, 5, 7, 4, 2],
        description: 'A stone heather full-zip hoodie with a royal blue interference grid and a small signal mark on the chest.',
      },
    ],
  },
];

export const collections = collectionDetails.map(({ items, comingSoon = true, ...collection }) => ({
  ...collection,
  comingSoon,
  actor: collection.name,
  featured: items[0].slug,
  products: items.map(product => ({
    ...product,
    ...product.variants?.[0],
    comingSoon,
    collection: collection.slug,
    collectionName: collection.name,
    actor: collection.name,
  })),
}));

export const chapterCollections = collections.filter(collection => collection.showChapter);
export const actorProducts = collections.flatMap(collection => collection.products);

const collectionPortraits = {
  'october-23rd-drop': 'model-rebel-forest-green',
  'new-drop-incoming': 'model-new-drop-incoming',
  'allu-arjun': 'model-grain-grit',
  'mahesh-babu': 'model-motion-archive',
  'ram-charan': 'model-heatwave-press',
  'pawan-kalyan': 'model-signal-works',
};

export function collectionPortrait(slug) {
  return `/images/${collectionPortraits[slug] ?? 'cast-' + slug}.webp`;
}
