export const teeTypes = [
  {
    slug: 'graphic',
    name: 'Graphic tees',
    image: '/images/fireline-back.webp',
    description: 'Illustrated motifs and large back prints.',
  },
  {
    slug: 'typography',
    name: 'Typography tees',
    image: '/images/style-code-back.webp',
    description: 'Oversized lettering and bold titles.',
  },
  {
    slug: 'geometric',
    name: 'Geometric tees',
    image: '/images/silver-screen-back.webp',
    description: 'Grids, rings and repeating forms.',
  },
  {
    slug: 'hoodie',
    name: 'Hoodies',
    image: '/images/night-shift-hoodie-back.webp',
    description: 'Oversized pullovers and full-zip hoodies.',
  },
].map(type => ({ ...type, id: type.slug }));

const collectionDetails = [
  {
    slug: 'prabhas',
    name: 'Rebelwood',
    description: 'Carved timber, split ridges, and after-dark graphics.',
    items: [
      {
        slug: 'rebelwood', teeType: 'graphic', name: 'Rebelwood', color: 'Washed black', hex: '#353535',
        price: 139900, stock: [3, 8, 9, 5, 3],
        description: 'A timber-ring chest badge and a sun splitting the ridge across the back.',
      },
      {
        slug: 'midnight-rebel', teeType: 'typography', name: 'Midnight Rebel', color: 'Bone', hex: '#e4ddcb',
        price: 129900, stock: [2, 6, 7, 4, 2],
        description: 'A midnight star on the chest and circular lettering that radiates across the back.',
      },
    ],
  },
  {
    slug: 'frame-shift-studio',
    name: 'Frame District',
    description: 'Amber and cobalt exposure studies.',
    items: [
      {
        slug: 'frame-district-tee', garment: 'tee', teeType: 'geometric', name: 'Frame District Tee', color: 'Charcoal', hex: '#323334',
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

export const collections = collectionDetails.map(({ items, ...collection }) => ({
  ...collection,
  actor: collection.name,
  featured: items[0].slug,
  products: items.map(product => ({
    ...product,
    collection: collection.slug,
    collectionName: collection.name,
    actor: collection.name,
  })),
}));

export const actorProducts = collections.flatMap(collection => collection.products);

const collectionPortraits = {
  prabhas: 'model-rebelwood-white',
  'allu-arjun': 'model-grain-grit',
  'mahesh-babu': 'model-motion-archive',
  'ram-charan': 'model-heatwave-press',
  'pawan-kalyan': 'model-signal-works',
};

export function collectionPortrait(slug) {
  return `/images/${collectionPortraits[slug] ?? 'cast-' + slug}.webp`;
}
