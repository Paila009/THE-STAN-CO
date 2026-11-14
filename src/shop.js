import QRCode from 'qrcode';
import { actorProducts, teeTypes } from './collections.js';
import './shop.css';

const drop = { slug: 'oct23ed', name: '#oct23ed Drop' };
const featuredProducts = [
  { slug: 'original-rebel-green', teeType: 'graphic', name: 'The Original Rebel Classic T-Shirt', color: 'Forest green', hex: '#113729', image: '/images/rebel-tee-green.webp', description: 'A deep-green crew-neck tee with a small, warm-toned rebel print at the chest.' },
  { slug: 'original-rebel-black', teeType: 'graphic', name: 'The Original Rebel Classic T-Shirt', color: 'Black', hex: '#222222', image: '/images/rebel-tee-black.webp', description: 'A black crew-neck tee with a small white rebel print at the chest.' },
  { slug: 'king-of-the-sea-pendant', teeType: 'accessory', name: 'King of the Sea Pendant', color: 'Natural shell', hex: '#dfc5a0', image: '/images/king-of-the-sea-pendant.webp', description: 'A cream and amber shell pendant on a rust-and-black twisted cord.' },
].map(product => ({ ...product, collection: drop.slug, collectionName: drop.name }));
const hoodieProducts = actorProducts.filter(product => product.garment === 'hoodie');
export const products = [...featuredProducts, ...hoodieProducts];
const shopTypes = teeTypes.filter(type => type.slug === 'graphic' || type.slug === 'hoodie')
  .concat({ slug: 'accessory', name: 'Accessories' });

const searchWords = text => text.toLocaleLowerCase('en-IN').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
const sizeChart = [[42, 27], [44, 28], [46, 29], [48, 30], [50, 31]];
const hoodieSizeChart = [[44, 26], [46, 27], [48, 28], [50, 29], [52, 30]];
const cartKey = 'the-stan-co:first-show:bag';
const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const price = amount => rupees.format(amount / 100);
const productFor = slug => products.find(product => product.slug === slug);
const garmentName = product => product.image || product.garment === 'hoodie' || /\btee$/i.test(product.name) ? product.name : product.name + ' tee';
const photoDescription = (product, side) => `${product.color} ${garmentName(product)}, ${side} view`;
const art = (product, side = 'front') => product.image ?? '/images/' + product.slug + '-' + side + '.webp';
const quantityInStock = (product, size) => product.stock?.[sizes.indexOf(size)] ?? 0;

function readBag() {
  try {
    const saved = JSON.parse(localStorage.getItem(cartKey) || '[]');
    if (!Array.isArray(saved)) return [];
    const bag = [];
    for (const item of saved) {
      const product = productFor(item?.slug);
      if (!product || !Number.isInteger(item.quantity) || item.quantity <= 0) continue;
      const limit = quantityInStock(product, item.size);
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
  const back = product.image ? '' : '<img class="stan-card-back" src="' + art(product, 'back') + '" width="780" height="900" alt="" loading="lazy" decoding="async">';
  const cost = product.price === undefined ? 'Price pending' : price(product.price);
  return '<article class="stan-card"><button class="stan-card-button" data-product="' + product.slug + '" aria-label="View ' + garmentName(product) + ', ' + product.color + '">'
    + '<span class="stan-card-art"><img src="' + art(product) + '" width="780" height="900" alt="" loading="lazy" decoding="async">' + back + '<span class="stan-card-open" aria-hidden="true">↗</span></span>'
    + '<span class="stan-card-meta"><span class="stan-card-name">' + product.name + '</span><span class="stan-card-price">' + cost + '</span></span><span class="stan-card-color">' + product.color + ' · ' + product.collectionName + '</span></button></article>';
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
    drop,
    ...hoodieProducts.map(product => ({ slug: product.collection, name: product.collectionName })),
  ];
  const colours = [...new Set(products.map(product => product.color))].sort();
  const typeNames = new Map(shopTypes.map(type => [type.slug, type.name]));
  const initialLimit = 8;
  let expanded = false;

  shop.innerHTML = '<div class="stan-shop-shell"><div class="stan-shop-heading">'
    + '<div><p class="stan-mono stan-shop-kicker">The Stan Co.</p><h2 id="stan-shop-title" tabindex="-1">Shop the drop<span>.</span></h2><p class="stan-preview-note">Concept prices and availability</p></div></div>'
    + '<div class="stan-shop-tools" aria-label="Filter and sort clothing">'
    + '<label class="stan-filter-field stan-search"><span>Search clothing</span><input type="search" placeholder="Product, collection, colour or style"></label>'
    + '<label class="stan-filter-field"><span>Collection</span><select class="stan-collection-filter">'
    + collectionChoices.map(collection => '<option value="' + collection.slug + '">' + collection.name + '</option>').join('')
    + '</select></label><label class="stan-filter-field"><span>Design type</span><select class="stan-type-filter">'
    + '<option value="">All types</option>' + shopTypes.map(type => '<option value="' + type.slug + '">' + type.name + '</option>').join('')
    + '</select></label><label class="stan-filter-field"><span>Colour</span><select class="stan-colour-filter">'
    + '<option value="">All colours</option>' + colours.map(colour => '<option>' + colour + '</option>').join('')
    + '</select></label><label class="stan-filter-field"><span>Sort</span><select class="stan-sort">'
    + '<option value="drop">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option>'
    + '</select></label></div>'
    + '<p class="stan-result-count" role="status"></p><div class="stan-catalog"></div>'
    + '<p class="stan-no-matches" hidden>No items match these filters. <button type="button" data-shop-clear>Clear filters</button></p>'
    + '<button type="button" class="stan-show-all" hidden></button></div>';
  const grid = shop.querySelector('.stan-catalog');
  const search = shop.querySelector('input[type="search"]');
  const collectionFilter = shop.querySelector('.stan-collection-filter');
  const typeFilter = shop.querySelector('.stan-type-filter');
  const colourFilter = shop.querySelector('.stan-colour-filter');
  const sort = shop.querySelector('.stan-sort');
  const status = shop.querySelector('[role="status"]');
  const noMatches = shop.querySelector('.stan-no-matches');
  const showAll = shop.querySelector('.stan-show-all');

  function renderCatalog() {
    const keywords = searchWords(search.value).split(' ').filter(Boolean);
    const visible = products.filter(product => {
      if (collectionFilter.value !== 'all' && collectionFilter.value !== product.collection) return false;
      if (typeFilter.value && typeFilter.value !== product.teeType) return false;
      if (colourFilter.value && colourFilter.value !== product.color) return false;
      const text = searchWords([product.name, product.collection, product.collectionName, product.color, product.description, typeNames.get(product.teeType)].join(' '));
      return keywords.every(keyword => text.includes(keyword));
    });

    if (sort.value === 'low') visible.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sort.value === 'high') visible.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));

    const displayed = expanded ? visible : visible.slice(0, initialLimit);
    grid.innerHTML = displayed.map(catalogCard).join('');
    status.textContent = displayed.length === visible.length
      ? visible.length + (visible.length === 1 ? ' item' : ' items')
      : 'Showing ' + displayed.length + ' of ' + visible.length + ' items';
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
  shop.querySelector('[data-shop-clear]').addEventListener('click', () => {
    clearFilters();
    search.focus();
  });
  showAll.addEventListener('click', () => {
    expanded = true;
    renderCatalog();
    grid.children[initialLimit]?.querySelector('button')?.focus();
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
    if (product.image) {
      show('product', product.name, '<div class="stan-product"><div class="stan-product-art">'
        + '<img src="' + product.image + '" alt="' + product.name + ' in ' + product.color + '"></div>'
        + '<div class="stan-product-details"><p><span class="stan-swatch" style="--swatch:' + product.hex + '"></span>' + product.color + '</p>'
        + '<p>' + product.description + '</p><p class="stan-muted">Pricing and availability to be announced.</p></div></div>', { wide: true });
      return;
    }
    const isHoodie = product.garment === 'hoodie';
    const measurements = isHoodie ? hoodieSizeChart : sizeChart;
    const modelControls = isHoodie ? '' : '<button type="button" class="stan-view-3d" data-shop-action="view-3d" aria-pressed="false">View 3D</button>';
    const available = sizes.map(size => quantityInStock(product, size) - (bag.find(item => item.slug === product.slug && item.size === size)?.quantity || 0));
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
    if (!selectedSize) {
      dialog.querySelector('.stan-status').textContent = 'Choose a size to add this item.';
      dialog.querySelector('[data-size]:enabled')?.focus();
      return;
    }
    const existing = bag.find(item => item.slug === activeProduct.slug && item.size === selectedSize);
    const limit = quantityInStock(activeProduct, selectedSize);
    if (!limit || (existing && existing.quantity >= limit)) {
      dialog.querySelector('.stan-status').textContent = 'You’ve reached the available quantity for this size.';
      return;
    }
    if (existing) existing.quantity += 1;
    else bag.push({ slug: activeProduct.slug, size: selectedSize, quantity: 1 });
    saveBag();
    showBag();
  }

  function showBag(focus) {
    let content = '<p class="stan-empty">Your bag is empty.</p><button type="button" class="stan-cta" data-shop-action="browse">Shop the drop <span aria-hidden="true">↗</span></button>';
    if (bag.length) {
      const lines = bag.map(item => {
        const product = productFor(item.slug);
        const key = item.slug + ':' + item.size;
        return '<li class="stan-bag-item"><img src="' + art(product) + '" alt="" width="70" height="80"><div><h3>' + product.name + '</h3><p>' + product.color + ' / ' + item.size + '</p>'
          + '<div class="stan-quantity"><button type="button" data-shop-action="decrease" data-line="' + key + '" aria-label="Decrease ' + product.name + ' size ' + item.size + ' quantity">−</button><span aria-label="Quantity">' + item.quantity + '</span>'
          + '<button type="button" data-shop-action="increase" data-line="' + key + '" aria-label="Increase ' + product.name + ' size ' + item.size + ' quantity"' + (item.quantity >= quantityInStock(product, item.size) ? ' disabled' : '') + '>+</button>'
          + '<button type="button" class="stan-remove" data-shop-action="remove" data-line="' + key + '" aria-label="Remove ' + product.name + ' size ' + item.size + '">Remove</button></div></div><strong>' + price(product.price * item.quantity) + '</strong></li>';
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
    if (action === 'increase') item.quantity = Math.min(quantityInStock(product, item.size), item.quantity + 1);
    if (action === 'decrease') item.quantity -= 1;
    if (action === 'remove' || item.quantity <= 0) bag = bag.filter(entry => entry !== item);
    saveBag();
    let focus;
    if (bag.includes(item)) {
      const nextAction = action === 'increase' && item.quantity === quantityInStock(product, item.size) ? 'decrease' : action;
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
      return '<tr><th scope="row">' + product.name + '<small>' + product.color + ' / ' + item.size + '</small></th><td>' + item.quantity + '</td><td>' + price(product.price) + '</td><td>' + price(product.price * item.quantity) + '</td></tr>';
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
