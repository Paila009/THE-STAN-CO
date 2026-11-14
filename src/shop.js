import QRCode from 'qrcode';
import { actorProducts, collections, teeTypes } from './collections.js';
import './shop.css';

const firstShowProducts = [
  { slug: 'first-show', teeType: 'typography', name: 'First Show', color: 'Washed black', hex: '#353535', price: 109900, stock: [3, 6, 8, 5, 2], description: 'A ticket on the chest and a burst of projector light and confetti across the back.' },
  { slug: 'fire-flood', teeType: 'graphic', name: 'Fire & Flood', color: 'Bone', hex: '#e4ddcb', price: 119900, stock: [2, 6, 7, 4, 1], description: 'A small elemental crest up front. Cobalt waves meet flame-orange contours on the back.' },
  { slug: 'small-fury', teeType: 'graphic', name: 'Small Fury', color: 'Deep olive', hex: '#40483b', price: 109900, stock: [0, 3, 6, 4, 2], description: 'A tiny citrus fly on the chest. A close-up of its wings and a ringed lens on the back.' },
  { slug: 'home-turf', teeType: 'geometric', name: 'Home Turf', color: 'Cobalt', hex: '#2547af', price: 119900, stock: [2, 4, 6, 2, 0], description: 'A cream court mark on the chest. Kabaddi court lines and orange boundary marks on the back.' },
].map(product => ({ ...product, collection: 'first-show', collectionName: 'First Show' }));

export const products = [...actorProducts, ...firstShowProducts];
const optionsFor = product => product.variants?.map(variant => ({ ...product, ...variant })) ?? [product];
const productOptions = products.flatMap(optionsFor);

const searchWords = text => text.toLocaleLowerCase('en-IN').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
const sizeChart = [[42, 27], [44, 28], [46, 29], [48, 30], [50, 31]];
const hoodieSizeChart = [[44, 26], [46, 27], [48, 28], [50, 29], [52, 30]];
const cartKey = 'the-stan-co:first-show:bag';
const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const price = amount => rupees.format(amount / 100);
const productFor = slug => productOptions.find(product => product.slug === slug);
const garmentName = product => product.image || product.garment === 'hoodie' || /\btee$/i.test(product.name) ? product.name : product.name + ' tee';
const photoDescription = (product, side) => `${product.color} ${garmentName(product)}, ${side} view`;
const art = (product, side = 'front') => product.image ?? '/images/' + product.slug + '-' + side + '.webp';
const isAccessory = product => product.garment === 'accessory';
const quantityLimit = (product, size) => {
  if (product.comingSoon) return 0;
  if (isAccessory(product)) return size === '' ? Infinity : 0;
  const index = sizes.indexOf(size);
  if (index < 0) return 0;
  return product.stock?.[index] ?? Infinity;
};
const lineDescription = (product, size) => size ? product.color + ' / ' + size : product.color;

function readBag() {
  try {
    const saved = JSON.parse(localStorage.getItem(cartKey) || '[]');
    if (!Array.isArray(saved)) return [];
    const bag = [];
    for (const item of saved) {
      const product = productFor(item?.slug);
      if (!product || !Number.isInteger(item.quantity) || item.quantity <= 0) continue;
      const limit = quantityLimit(product, item.size);
      if (limit <= 0) continue;
      const line = bag.find(entry => entry.slug === product.slug && entry.size === item.size);
      if (line) line.quantity = Math.min(limit, line.quantity + item.quantity);
      else bag.push({ slug: product.slug, size: item.size, quantity: Math.min(limit, item.quantity) });
    }
    return bag;
  } catch {
    return [];
  }
}

function catalogCard(product) {
  const photo = '<img src="' + art(product) + '" width="780" height="900" alt="" loading="lazy" decoding="async">';
  if (product.comingSoon) {
    return '<article class="stan-card stan-card--upcoming"><div class="stan-card-art">' + photo + '</div>'
      + '<div class="stan-card-meta"><span class="stan-card-name">' + product.name + '</span>'
      + '<span class="stan-coming-soon">Coming soon</span></div><p class="stan-card-color">' + product.color + ' · ' + product.collectionName + '</p></article>';
  }
  const back = product.image ? '' : '<img class="stan-card-back" src="' + art(product, 'back') + '" width="780" height="900" alt="" loading="lazy" decoding="async">';
  const colourLabel = product.variants ? product.variants.length + ' colours' : product.color;
  return '<article class="stan-card"><button class="stan-card-button" data-product="' + product.slug + '" aria-label="View ' + garmentName(product) + '">'
    + '<span class="stan-card-art">' + photo + back + '<span class="stan-card-open" aria-hidden="true">↗</span></span>'
    + '<span class="stan-card-meta"><span class="stan-card-name">' + product.name + '</span><span class="stan-card-price">' + price(product.price) + '</span></span><span class="stan-card-color">' + colourLabel + ' · ' + product.collectionName + '</span></button></article>';
}

export function mountShop({ shop, dialog }) {
  let bag = readBag();
  let activeProduct;
  let selectedSize;
  let side = 'front';
  let lastTrigger;
  let currentView;
  let preview;
  let productViewer;
  let viewerGeneration = 0;

  function stopViewer() {
    viewerGeneration += 1;
    productViewer?.dispose();
    productViewer = undefined;
  }
  const collectionChoices = [
    { slug: 'all', name: 'All collections' },
    ...collections,
    { slug: 'first-show', name: 'First Show' },
  ];
  const colours = [...new Set(productOptions.map(product => product.color))].sort();
  const typeNames = new Map(teeTypes.map(type => [type.slug, type.name]));
  const initialLimit = 8;
  let expanded = false;

  shop.innerHTML = '<div class="stan-shop-shell"><header class="stan-shop-heading">'
    + '<div class="stan-shop-heading-copy"><h2 id="stan-shop-title" tabindex="-1">Shop the<br> drop<span>.</span></h2>'
    + '<a class="stan-shop-featured" href="#shop" data-collection="october-23rd-drop">October 23rd Drop <span aria-hidden="true">↗</span></a>'
    + '<p class="stan-preview-note">Store preview</p></div>'
    + '<div class="stan-shop-art" aria-hidden="true"><div class="stan-shop-pattern"></div>'
    + '<img class="stan-shop-model" src="/images/model-rebel-forest-green.webp" alt="" width="896" height="1120" loading="lazy" decoding="async">'
    + '<figure class="stan-shop-swatch"><img src="/images/rebel-tee-black.webp" alt="" width="940" height="905" loading="lazy" decoding="async"></figure></div></header>'
    + '<div class="stan-shop-tools" role="group" aria-label="Filter and sort clothing">'
    + '<label class="stan-filter-field stan-search"><span>Search clothing</span><input type="search" placeholder="Search by name, colour or style"></label>'
    + '<label class="stan-filter-field"><span id="stan-filter-collection">Collection</span><select class="stan-collection-filter" aria-labelledby="stan-filter-collection">'
    + collectionChoices.map(collection => '<option value="' + collection.slug + '">' + collection.name + '</option>').join('')
    + '</select></label><label class="stan-filter-field"><span id="stan-filter-type">Design type</span><select class="stan-type-filter" aria-labelledby="stan-filter-type">'
    + '<option value="">All types</option>' + teeTypes.map(type => '<option value="' + type.slug + '">' + type.name + '</option>').join('')
    + '</select></label><label class="stan-filter-field"><span id="stan-filter-colour">Colour</span><select class="stan-colour-filter" aria-labelledby="stan-filter-colour">'
    + '<option value="">All colours</option>' + colours.map(colour => '<option>' + colour + '</option>').join('')
    + '</select></label><label class="stan-filter-field"><span id="stan-filter-sort">Sort</span><select class="stan-sort" aria-labelledby="stan-filter-sort">'
    + '<option value="drop">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option>'
    + '</select></label></div>'
    + '<div class="stan-shop-results"><p class="stan-result-count" role="status"></p><button type="button" class="stan-filter-reset" data-shop-clear hidden>Reset filters <span aria-hidden="true">×</span></button></div><div class="stan-catalog"></div>'
    + '<p class="stan-no-matches" hidden>No items match these filters. <button type="button" data-shop-clear>Clear filters</button></p>'
    + '<button type="button" class="stan-show-all" hidden></button></div>';
  const grid = shop.querySelector('.stan-catalog');
  const search = shop.querySelector('input[type="search"]');
  const collectionFilter = shop.querySelector('.stan-collection-filter');
  const typeFilter = shop.querySelector('.stan-type-filter');
  const colourFilter = shop.querySelector('.stan-colour-filter');
  const sort = shop.querySelector('.stan-sort');
  const status = shop.querySelector('[role="status"]');
  const reset = shop.querySelector('.stan-filter-reset');
  const noMatches = shop.querySelector('.stan-no-matches');
  const showAll = shop.querySelector('.stan-show-all');

  function renderCatalog() {
    const keywords = searchWords(search.value).split(' ').filter(Boolean);
    const matches = product => {
      if (collectionFilter.value !== 'all' && collectionFilter.value !== product.collection) return false;
      if (typeFilter.value && typeFilter.value !== product.teeType) return false;
      if (colourFilter.value && colourFilter.value !== product.color) return false;
      const text = searchWords([product.name, product.collection, product.collectionName, product.color, product.description, typeNames.get(product.teeType)].join(' '));
      return keywords.every(keyword => text.includes(keyword));
    };
    const visible = products.map(product => optionsFor(product).find(matches)).filter(Boolean);

    if (sort.value !== 'drop') {
      const direction = sort.value === 'low' ? 1 : -1;
      visible.sort((a, b) => Number(!!a.comingSoon) - Number(!!b.comingSoon)
        || (a.comingSoon ? 0 : direction * (a.price - b.price)));
    }

    const displayed = expanded ? visible : visible.slice(0, initialLimit);
    grid.innerHTML = displayed.map(catalogCard).join('');
    status.textContent = displayed.length === visible.length
      ? visible.length + (visible.length === 1 ? ' item' : ' items')
      : 'Showing ' + displayed.length + ' of ' + visible.length + ' items';
    reset.hidden = !search.value.trim() && collectionFilter.value === 'all' && !typeFilter.value && !colourFilter.value && sort.value === 'drop';
    noMatches.hidden = visible.length > 0;
    showAll.hidden = displayed.length === visible.length;
    showAll.textContent = 'Show all ' + visible.length + ' items';
  }

  function resetAndRender() {
    expanded = false;
    renderCatalog();
  }

  function clearFilters({ collection = 'all', teeType = '' } = {}) {
    search.value = '';
    collectionFilter.value = collection;
    typeFilter.value = teeType;
    colourFilter.value = '';
    resetAndRender();
  }

  search.addEventListener('input', resetAndRender);
  [collectionFilter, typeFilter, colourFilter, sort].forEach(control => control.addEventListener('change', resetAndRender));
  for (const button of shop.querySelectorAll('[data-shop-clear]')) {
    button.addEventListener('click', () => {
      sort.value = 'drop';
      clearFilters();
      search.focus();
    });
  }
  showAll.addEventListener('click', () => {
    expanded = true;
    renderCatalog();
    const firstAdded = grid.children[initialLimit];
    if (firstAdded) {
      const target = firstAdded.querySelector('button') ?? firstAdded;
      if (target === firstAdded) target.tabIndex = -1;
      target.focus();
    }
  });
  renderCatalog();

  function updateCount() {
    const count = bag.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('[data-bag-count]').forEach(element => { element.textContent = count; });
  }

  function saveBag() {
    try {
      localStorage.setItem(cartKey, JSON.stringify(bag));
    } catch {
      // The bag remains usable in this tab when storage is unavailable.
    }
    updateCount();
  }

  function subtotal() {
    return bag.reduce((total, item) => total + productFor(item.slug).price * item.quantity, 0);
  }

  function show(view, title, content, { wide = false, focus } = {}) {
    stopViewer();
    currentView = view;
    dialog.className = 'stan-dialog' + (wide ? ' stan-dialog-wide' : '') + (view === 'invoice' ? ' stan-dialog-invoice' : '');
    dialog.setAttribute('aria-labelledby', 'stan-dialog-title');
    dialog.removeAttribute('aria-label');
    dialog.innerHTML = '<div class="stan-dialog-head"><h2 id="stan-dialog-title" tabindex="-1">' + title + '</h2>'
      + '<button type="button" class="stan-dialog-close" data-shop-action="close" aria-label="Close">×</button></div>'
      + '<div class="stan-dialog-body">' + content + '</div>';
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    (focus && dialog.querySelector(focus) || dialog.querySelector('#stan-dialog-title')).focus({ preventScroll: true });
  }

  function showProduct() {
    const product = activeProduct;
    if (product.comingSoon) {
      show('product', product.name, '<div class="stan-product stan-card--upcoming"><div class="stan-product-photo">'
        + '<img src="' + art(product) + '" alt="' + photoDescription(product, 'front') + '"></div>'
        + '<div class="stan-product-details"><span class="stan-coming-soon">Coming soon</span><p>' + product.description
        + '</p></div></div>', { wide: true });
      return;
    }
    if (product.image) {
      showPhotoProduct(product);
      return;
    }
    const isHoodie = product.garment === 'hoodie';
    const measurements = isHoodie ? hoodieSizeChart : sizeChart;
    const modelControls = isHoodie ? '' : '<button type="button" class="stan-view-3d" data-shop-action="view-3d" aria-pressed="false">View 3D</button>';
    const available = sizes.map(size => quantityLimit(product, size) - (bag.find(item => item.slug === product.slug && item.size === size)?.quantity || 0));
    show('product', product.name, '<div class="stan-product"><div><div class="stan-product-art"><img id="stan-product-photo" src="' + art(product, side) + '" width="780" height="900" alt="' + photoDescription(product, side) + '"><div class="hero-render stan-product-render" aria-hidden="true"></div></div>'
      + '<div class="stan-sides" role="group" aria-label="Garment view"><button type="button" data-shop-action="front" aria-pressed="' + (side === 'front') + '">Front</button><button type="button" data-shop-action="back" aria-pressed="' + (side === 'back') + '">Back</button>' + modelControls + '</div><p class="stan-viewer-status" role="status"></p></div>'
      + '<div class="stan-product-details"><div class="stan-product-price">' + price(product.price) + '</div><p><span class="stan-swatch" style="--swatch:' + product.hex + '"></span>' + product.color + ' · ' + product.collectionName + '</p><p>' + product.description + '</p>'
      + '<div class="stan-size-row"><strong>Select size</strong><button type="button" class="stan-link-button" data-shop-action="size-guide" aria-expanded="false" aria-controls="stan-size-chart">Size guide</button></div>'
      + '<div class="stan-size-guide" id="stan-size-chart" hidden><table><caption>Sample ' + (isHoodie ? 'hoodie' : 'tee') + ' measurements in inches</caption><thead><tr><th scope="col">Size</th><th scope="col">Chest</th><th scope="col">Length</th></tr></thead><tbody>'
      + sizes.map((size, index) => '<tr><th scope="row">' + size + '</th><td>' + measurements[index][0] + '</td><td>' + measurements[index][1] + '</td></tr>').join('')
      + '</tbody></table></div><div class="stan-sizes" role="group" aria-label="Garment sizes">'
      + sizes.map((size, index) => '<button type="button" data-size="' + size + '" aria-pressed="' + (selectedSize === size) + '"' + (available[index] <= 0 ? ' disabled aria-label="' + size + ', unavailable"' : '') + '>' + size + '</button>').join('')
      + '</div><p class="stan-status" role="status"></p><button type="button" class="stan-cta" data-shop-action="add">Add to bag <span aria-hidden="true">↗</span></button>'
      + '<details class="stan-exchanges"><summary>Shipping &amp; exchanges</summary><p>Exchanges only. Delivery and exchange terms will be confirmed before launch.</p></details></div></div>', { wide: true });
  }

  function showPhotoProduct(product, focus) {
    const colours = product.variants ? '<div class="stan-sides" role="group" aria-label="Colour">'
      + product.variants.map(variant => '<button type="button" data-colour-option="' + variant.slug + '" aria-pressed="' + (variant.slug === product.slug) + '">' + variant.color + '</button>').join('')
      + '</div>' : '';
    const sizeOptions = isAccessory(product) ? '' : '<div class="stan-size-row"><strong>Select size</strong></div>'
      + '<div class="stan-sizes" role="group" aria-label="T-shirt sizes">'
      + sizes.map(size => '<button type="button" data-size="' + size + '" aria-pressed="' + (selectedSize === size) + '">' + size + '</button>').join('')
      + '</div>';
    const availability = isAccessory(product) ? 'Availability will be confirmed before launch.' : 'Sizes and availability will be confirmed before launch.';
    show('product', product.name, '<div class="stan-product"><div class="stan-product-photo">'
      + '<img src="' + product.image + '" alt="' + photoDescription(product, 'front') + '"></div>'
      + '<div class="stan-product-details"><div class="stan-product-price">' + price(product.price) + '</div><p>' + product.description + '</p>'
      + colours + sizeOptions + '<p class="stan-muted">' + availability + '</p><p class="stan-status" role="status"></p>'
      + '<button type="button" class="stan-cta" data-shop-action="add">Add to bag <span aria-hidden="true">↗</span></button></div></div>', { wide: true, focus });
  }

  function changeSide(nextSide) {
    side = nextSide;
    productViewer?.setProduct(activeProduct, side);
    const photo = dialog.querySelector('#stan-product-photo');
    photo.src = art(activeProduct, side);
    photo.alt = photoDescription(activeProduct, side);
    dialog.querySelectorAll('[data-shop-action=front], [data-shop-action=back]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.shopAction === side)));
  }

  async function toggleProductViewer(button) {
    if (button.getAttribute('aria-disabled') === 'true') return;
    const feedback = dialog.querySelector('.stan-viewer-status');
    if (productViewer) {
      stopViewer();
      button.setAttribute('aria-pressed', 'false');
      button.textContent = 'View 3D';
      feedback.textContent = '';
      return;
    }

    const stage = dialog.querySelector('.stan-product-art');
    const generation = ++viewerGeneration;
    const isCurrent = () => generation === viewerGeneration && dialog.open && stage.isConnected;
    const fallback = () => {
      if (!isCurrent()) return;
      stopViewer();
      button.removeAttribute('aria-disabled');
      button.setAttribute('aria-pressed', 'false');
      button.textContent = 'View 3D';
      feedback.textContent = '3D is unavailable. Front and back photos are ready to view.';
    };
    button.setAttribute('aria-disabled', 'true');
    button.textContent = 'Loading 3D…';

    try {
      const { mountTee } = await import('./tee.js');
      if (!isCurrent()) return;
      productViewer = mountTee(stage, () => ({ product: activeProduct, face: side }), {
        allowReducedMotion: true,
        onReady: () => {
          if (!isCurrent()) return;
          button.removeAttribute('aria-disabled');
          button.setAttribute('aria-pressed', 'true');
          button.textContent = 'Exit 3D';
          feedback.textContent = 'Drag the tee to rotate. Use Front and Back to reset the view.';
        },
        onUnavailable: fallback,
      });
    } catch {
      fallback();
    }
  }

  function addProduct() {
    const size = isAccessory(activeProduct) ? '' : selectedSize;
    if (size === undefined) {
      dialog.querySelector('.stan-status').textContent = 'Choose a size to add this item.';
      dialog.querySelector('[data-size]:enabled')?.focus();
      return;
    }
    const existing = bag.find(item => item.slug === activeProduct.slug && item.size === size);
    const limit = quantityLimit(activeProduct, size);
    if (!limit || (existing && existing.quantity >= limit)) {
      dialog.querySelector('.stan-status').textContent = 'You’ve reached the available quantity for this size.';
      return;
    }
    if (existing) existing.quantity += 1;
    else bag.push({ slug: activeProduct.slug, size, quantity: 1 });
    saveBag();
    showBag();
  }

  function showBag(focus) {
    let content = '<p class="stan-empty">Your bag is empty.</p><button type="button" class="stan-cta" data-shop-action="browse">Shop the drop <span aria-hidden="true">↗</span></button>';
    if (bag.length) {
      const lines = bag.map(item => {
        const product = productFor(item.slug);
        const key = item.slug + ':' + item.size;
        const label = product.name + ', ' + lineDescription(product, item.size);
        return '<li class="stan-bag-item"><img src="' + art(product) + '" alt="" width="70" height="80"><div><h3>' + product.name + '</h3><p>' + lineDescription(product, item.size) + '</p>'
          + '<div class="stan-quantity"><button type="button" data-shop-action="decrease" data-line="' + key + '" aria-label="Decrease quantity of ' + label + '">−</button><span aria-label="Quantity">' + item.quantity + '</span>'
          + '<button type="button" data-shop-action="increase" data-line="' + key + '" aria-label="Increase quantity of ' + label + '"' + (item.quantity >= quantityLimit(product, item.size) ? ' disabled' : '') + '>+</button>'
          + '<button type="button" class="stan-remove" data-shop-action="remove" data-line="' + key + '" aria-label="Remove ' + label + '">Remove</button></div></div><strong>' + price(product.price * item.quantity) + '</strong></li>';
      }).join('');
      content = '<ul class="stan-bag-lines">' + lines + '</ul><div class="stan-total"><span>Subtotal</span><strong>' + price(subtotal()) + '</strong></div>'
        + '<p class="stan-muted">Shipping and tax will be confirmed before launch.</p><button type="button" class="stan-cta" data-shop-action="checkout">Checkout preview <span aria-hidden="true">↗</span></button>';
    }
    show('bag', 'Your bag', content, { focus });
  }

  function updateLine(action, key) {
    const item = bag.find(entry => entry.slug + ':' + entry.size === key);
    if (!item) return;
    const product = productFor(item.slug);
    if (action === 'increase') item.quantity = Math.min(quantityLimit(product, item.size), item.quantity + 1);
    if (action === 'decrease') item.quantity -= 1;
    if (action === 'remove' || item.quantity <= 0) bag = bag.filter(entry => entry !== item);
    saveBag();
    let focus;
    if (bag.includes(item)) {
      const nextAction = action === 'increase' && item.quantity === quantityLimit(product, item.size) ? 'decrease' : action;
      focus = '[data-shop-action="' + nextAction + '"][data-line="' + key + '"]';
    }
    showBag(focus);
  }

  function showCheckout() {
    if (!bag.length) {
      showBag();
      return;
    }
    preview = {
      token: 'STAN-DEMO-' + crypto.getRandomValues(new Uint32Array(2)).join('-'),
      date: new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' }),
    };
    show('checkout', 'Checkout preview', '<button type="button" class="stan-link-button stan-back-link" data-shop-action="bag">← Back to bag</button>'
      + '<div class="stan-total"><span>Merchandise subtotal</span><strong>' + price(subtotal()) + '</strong></div><p class="stan-muted">Shipping and tax are pending.</p>'
      + '<div class="stan-demo"><div class="stan-qr-box"><canvas class="stan-qr" role="img" aria-label="Sample QR code containing a demo text token"></canvas></div>'
      + '<div><h3>Demo QR · No payment</h3><p>Scanning reveals a random text reference. Payments and order submission are disabled in this preview.</p><p class="stan-token stan-mono">' + preview.token + '</p></div></div>'
      + '<button type="button" class="stan-cta" data-shop-action="invoice">View sample invoice <span aria-hidden="true">↗</span></button>');
    const canvas = dialog.querySelector('.stan-qr');
    QRCode.toCanvas(canvas, preview.token, { scale: 5, margin: 4, color: { dark: '#151515', light: '#ffffff' } })
      .catch(() => {
        if (canvas.isConnected) {
          const error = document.createElement('p');
          error.textContent = 'Demo QR unavailable';
          canvas.replaceWith(error);
        }
      });
  }

  function showInvoice() {
    if (!preview || !bag.length) {
      showBag();
      return;
    }
    const rows = bag.map(item => {
      const product = productFor(item.slug);
      return '<tr><th scope="row">' + product.name + '<small>' + lineDescription(product, item.size) + '</small></th><td>' + item.quantity + '</td><td>' + price(product.price) + '</td><td>' + price(product.price * item.quantity) + '</td></tr>';
    }).join('');
    show('invoice', 'Invoice preview', '<button type="button" class="stan-link-button stan-back-link" data-shop-action="checkout">← Back to checkout</button>'
      + '<div class="stan-invoice"><div class="stan-invoice-head"><strong>THE STAN CO.</strong><span class="stan-invoice-sample stan-mono">Sample invoice</span></div>'
      + '<div class="stan-invoice-info"><div><strong>Seller</strong><p>The Stan Co.<br>Business details pending</p></div><div><strong>Bill to</strong><p>Sample customer<br>Sample delivery address</p></div><div><strong>Date</strong><p>' + preview.date + '</p></div></div>'
      + '<table><thead><tr><th scope="col">Item</th><th scope="col">Qty</th><th scope="col">Price</th><th scope="col">Amount</th></tr></thead><tbody>' + rows + '</tbody></table>'
      + '<div class="stan-total"><span>Merchandise subtotal</span><strong>' + price(subtotal()) + '</strong></div>'
      + '<p class="stan-muted">Shipping and tax pending. Sample only. No payment received.</p></div>'
      + '<button type="button" class="stan-cta stan-invoice-print" data-shop-action="print">Print or save PDF <span aria-hidden="true">↗</span></button>');
  }

  function closeDialog() {
    stopViewer();
    dialog.close();
  }

  dialog.addEventListener('cancel', stopViewer);
  dialog.addEventListener('close', () => {
    stopViewer();
    currentView = undefined;
    if (lastTrigger?.isConnected) lastTrigger.focus({ preventScroll: true });
  });

  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog();
      return;
    }
    const colour = event.target.closest('[data-colour-option]');
    if (colour) {
      activeProduct = productFor(colour.dataset.colourOption);
      showPhotoProduct(activeProduct, '[data-colour-option="' + activeProduct.slug + '"]');
      return;
    }
    const size = event.target.closest('[data-size]');
    if (size) {
      selectedSize = size.dataset.size;
      dialog.querySelectorAll('[data-size]').forEach(button => button.setAttribute('aria-pressed', String(button === size)));
      dialog.querySelector('.stan-status').textContent = '';
      return;
    }
    const button = event.target.closest('[data-shop-action]');
    if (!button) return;
    switch (button.dataset.shopAction) {
      case 'close': closeDialog(); break;
      case 'browse':
        lastTrigger = undefined;
        closeDialog();
        shop.scrollIntoView();
        shop.querySelector('[data-product]')?.focus({ preventScroll: true });
        break;
      case 'front':
      case 'back': changeSide(button.dataset.shopAction); break;
      case 'view-3d': toggleProductViewer(button); break;
      case 'size-guide': {
        const guide = dialog.querySelector('#stan-size-chart');
        guide.hidden = !guide.hidden;
        button.setAttribute('aria-expanded', String(!guide.hidden));
        break;
      }
      case 'add': addProduct(); break;
      case 'bag': showBag(); break;
      case 'increase':
      case 'decrease':
      case 'remove': updateLine(button.dataset.shopAction, button.dataset.line); break;
      case 'checkout': showCheckout(); break;
      case 'invoice': showInvoice(); break;
      case 'print': window.print(); break;
    }
  });

  document.addEventListener('click', event => {
    const browseLink = event.target.closest('[data-collection], [data-tee-type]');
    if (browseLink) {
      const { collection, teeType } = browseLink.dataset;
      const hasCollection = collectionChoices.some(choice => choice.slug === collection);
      const hasType = typeNames.has(teeType);
      if (hasCollection || hasType) {
        event.preventDefault();
        clearFilters({ collection: hasCollection ? collection : 'all', teeType: hasType ? teeType : '' });
        shop.scrollIntoView();
        const focusTarget = hasType ? typeFilter : shop.querySelector('#stan-shop-title');
        focusTarget.focus({ preventScroll: true });
        return;
      }
    }
    const trigger = event.target.closest('[data-product], [data-bag]');
    if (!trigger) return;
    if (trigger.matches('[data-bag]')) {
      lastTrigger = trigger;
      showBag();
      return;
    }
    const product = productFor(trigger.dataset.product);
    if (!product) return;
    event.preventDefault();
    lastTrigger = trigger;
    activeProduct = product;
    selectedSize = undefined;
    side = 'front';
    showProduct();
  });

  window.addEventListener('storage', event => {
    if (event.key !== cartKey) return;
    bag = readBag();
    updateCount();
    if (currentView === 'bag') showBag();
    if (currentView === 'product') {
      selectedSize = undefined;
      showProduct();
    }
    if (currentView === 'checkout') showCheckout();
    if (currentView === 'invoice') showInvoice();
  });

  updateCount();
}
