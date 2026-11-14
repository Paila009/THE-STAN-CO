import './shop.css';

const products = [
  {
    id: 'rebel-classic',
    name: 'The Original Rebel Classic T-Shirt',
    category: 'Apparel',
    colours: [
      { id: 'green', name: 'Forest green', hex: '#254439', photo: '/images/rebel-green.webp' },
      { id: 'black', name: 'Black', hex: '#20201f', photo: '/images/rebel-black.webp' },
    ],
    price: 129900,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'A tee from the Original Rebel drop, available to preview in forest green and black.',
  },
  {
    id: 'king-of-the-sea',
    name: 'King of the Sea Pendant',
    category: 'Jewellery',
    colours: [],
    price: null,
    sizes: ['One size'],
    description: 'Photography, price and availability are coming soon.',
  },
];

const byId = new Map(products.map(product => [product.id, product]));
const bagKey = 'thestanco:editorial:bag:v1';
const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', trailingZeroDisplay: 'stripIfInteger' });
const inr = paise => money.format(paise / 100);
const maxQuantity = 9;
const lineKey = line => [line.id, line.colourId, line.size].join(':');
const findColour = (product, id) => product.colours.find(colour => colour.id === id);
const photoAlt = (product, colour) => product.name + ' in ' + colour.name.toLowerCase();

function readBag() {
  try {
    const stored = JSON.parse(localStorage.getItem(bagKey) || '[]');
    if (!Array.isArray(stored)) return [];

    const valid = new Map();
    for (const line of stored) {
      const product = line && byId.get(line.id);
      if (product?.price == null || !product.sizes.includes(line.size)) continue;
      if (!Number.isInteger(line.quantity) || line.quantity < 1) continue;
      const colour = line.colourId == null ? product.colours[0] : findColour(product, line.colourId);
      if (!colour) continue;
      const key = lineKey({ ...line, colourId: colour.id });
      const quantity = Math.min((valid.get(key)?.quantity || 0) + line.quantity, maxQuantity);
      valid.set(key, { id: line.id, colourId: colour.id, size: line.size, quantity });
    }
    return [...valid.values()];
  } catch {
    return [];
  }
}

function productCard(product) {
  const colour = product.colours[0];
  const photo = colour
    ? '<img src="' + colour.photo + '" alt="' + photoAlt(product, colour) + '" width="800" height="1000" loading="lazy" decoding="async">'
    : '<span class="rebel-photo-empty">Photography coming soon</span>';
  return [
    '<article class="rebel-product-card">',
    '<a class="rebel-product-photo' + (colour ? '' : ' rebel-product-photo--empty') + '" href="#product/' + product.id + '" data-product="' + product.id + '" aria-label="View ' + product.name + '">',
    photo,
    '<span aria-hidden="true">↗</span></a>',
    '<div class="rebel-product-caption"><div><p class="rebel-kicker">' + product.category + (colour ? ' / ' + product.colours.map(option => option.name).join(' · ') : ' / Coming soon') + '</p>',
    '<h3><a href="#product/' + product.id + '" data-product="' + product.id + '">' + product.name + '</a></h3></div>',
    '<span class="rebel-card-price">' + (product.price == null ? 'Price TBC' : inr(product.price) + ' sample') + '</span></div>',
    '</article>',
  ].join('');
}

function installDialog() {
  const existing = document.querySelector('#bag-dialog');
  if (existing) return existing;
  const dialog = document.createElement('dialog');
  dialog.id = 'bag-dialog';
  document.body.append(dialog);
  return dialog;
}

export function mountShop() {
  const shop = document.querySelector('#shop');
  if (!shop) return;
  const dialog = installDialog();
  dialog.classList.add('rebel-dialog');
  let bag = readBag();
  let activeProduct;
  let selectedColour;
  let selectedSize;
  let view;
  let cameFrom;
  let focusedElement;
  let clearProductRoute = false;
  let receiptNumber;

  const categories = ['All', ...new Set(products.map(product => product.category))];
  shop.innerHTML = [
    '<div class="rebel-shop-intro"><p class="rebel-shop-detail">Sample prices and availability for this shop preview.</p>',
    '<div class="rebel-shop-filters" role="group" aria-label="Browse by category">',
    categories.map((category, index) => '<button type="button" data-shop-filter="' + category + '" aria-pressed="' + (index === 0) + '">' + category + '</button>').join(''),
    '</div></div><p class="rebel-visually-hidden" role="status"></p><div class="rebel-product-grid"></div>',
  ].join('');
  const grid = shop.querySelector('.rebel-product-grid');
  const filterStatus = shop.querySelector('[role="status"]');

  function showCards(category) {
    const visible = category === 'All' ? products : products.filter(product => product.category === category);
    grid.innerHTML = visible.map(productCard).join('');
    filterStatus.textContent = visible.length + (visible.length === 1 ? ' item' : ' items');
  }
  showCards('All');

  shop.addEventListener('click', event => {
    const button = event.target.closest('[data-shop-filter]');
    if (!button) return;
    shop.querySelectorAll('[data-shop-filter]').forEach(filter => filter.setAttribute('aria-pressed', String(button === filter)));
    showCards(button.dataset.shopFilter);
  });

  function show(next, title, content, { wide = false, focus } = {}) {
    view = next;
    dialog.classList.toggle('rebel-dialog-wide', wide);
    dialog.classList.toggle('rebel-dialog-receipt', next === 'receipt');
    dialog.setAttribute('aria-labelledby', 'rebel-dialog-title');
    dialog.innerHTML = '<header class="rebel-dialog-head"><h2 id="rebel-dialog-title" tabindex="-1">' + title + '</h2>'
      + '<button type="button" class="rebel-close" data-shop-action="close" aria-label="Close">×</button></header>'
      + '<div class="rebel-dialog-body">' + content + '</div>';
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    const target = (focus && dialog.querySelector(focus)) || dialog.querySelector('#rebel-dialog-title');
    target.focus({ preventScroll: true });
  }

  function showProduct(options) {
    const product = activeProduct;
    const apparel = product.category === 'Apparel';
    if (product.price == null) {
      show('product', product.name, '<div class="rebel-product-detail"><div class="rebel-detail-photo rebel-product-photo--empty"><span class="rebel-photo-empty">Photography coming soon</span></div>'
        + '<div class="rebel-detail-info"><p class="rebel-kicker">Jewellery / Coming soon</p>'
        + '<p>' + product.description + '</p><p class="rebel-option-note">One size. Details pending.</p>' + shareLinks(product) + '</div></div>', { wide: true });
      return;
    }
    const sizing = apparel
      ? '<fieldset class="rebel-options"><legend>Demo size</legend><div class="rebel-sizes">'
        + product.sizes.map(size => '<button type="button" data-size="' + size + '" aria-pressed="' + (selectedSize === size) + '">' + size + '</button>').join('')
        + '</div><p>Size chart and stock to be confirmed.</p></fieldset>'
      : '<p class="rebel-option-note">One size · Concept preview</p>';
    const colours = apparel
      ? '<fieldset class="rebel-options"><legend>Colour</legend><div class="rebel-swatches">'
        + product.colours.map(colour => '<button type="button" class="rebel-swatch" data-colour="' + colour.id
          + '" aria-pressed="' + (selectedColour === colour) + '"><i style="--swatch:' + colour.hex + '" aria-hidden="true"></i>'
          + colour.name + '</button>').join('')
        + '</div></fieldset>'
      : '';
    show('product', product.name, '<div class="rebel-product-detail">'
      + '<div><button type="button" class="rebel-detail-photo" data-shop-action="zoom" aria-label="Enlarge product photo">'
      + '<img src="' + selectedColour.photo + '" alt="' + photoAlt(product, selectedColour) + '" width="800" height="1000">'
      + '<span aria-hidden="true">↗</span></button></div>'
      + '<div class="rebel-detail-info"><p class="rebel-kicker">' + product.category + ' / ' + (apparel ? 'Drop 01' : 'Concept') + '</p>'
      + '<p class="rebel-detail-price">' + inr(product.price) + ' <span>Sample price</span></p><p>' + product.description + '</p>'
      + colours + sizing + '<p class="rebel-action-feedback" role="status"></p>'
      + '<button type="button" class="rebel-primary" data-shop-action="add">Add to demo bag <span aria-hidden="true">↗</span></button>'
      + pinForm(product.id) + shareLinks(product) + '</div></div>', { wide: true, ...options });
  }

  function shareLinks(product) {
    const link = new URL('/#product/' + product.id, location.origin);
    const message = encodeURIComponent(product.name + ' · The Stan Co. ' + link.href);
    return '<div class="rebel-share"><button type="button" class="rebel-inline" data-shop-action="share">Share product</button>'
      + '<a href="https://wa.me/?text=' + message + '" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>'
      + '<button type="button" class="rebel-inline" data-shop-action="copy">Copy link</button>'
      + '<p role="status" class="rebel-share-status"></p></div>';
  }

  async function shareProduct(useNativeShare) {
    const status = dialog.querySelector('.rebel-share-status');
    const url = new URL('/#product/' + activeProduct.id, location.origin).href;
    try {
      if (useNativeShare && navigator.share) {
        await navigator.share({ title: activeProduct.name + ' · The Stan Co.', url });
        return;
      }
      await navigator.clipboard.writeText(url);
      status.textContent = 'Product link copied.';
    } catch (error) {
      if (error.name !== 'AbortError') status.textContent = 'Product link: ' + url;
    }
  }

  function showZoom() {
    const product = activeProduct;
    show('zoom', 'Product photo', '<button type="button" class="rebel-inline" data-shop-action="zoom-back">← Back to item</button>'
      + '<img class="rebel-photo-large" src="' + selectedColour.photo + '" alt="' + photoAlt(product, selectedColour) + '" width="800" height="1000">', { wide: true });
  }

  function pinForm(id) {
    return '<form class="rebel-pin-form" data-pin-check novalidate><label for="rebel-pin-' + id + '">Check a delivery PIN</label>'
      + '<div><input id="rebel-pin-' + id + '" name="pin" type="text" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="6-digit Indian PIN">'
      + '<button type="submit">Check</button></div>'
      + '<label class="rebel-pin-zone"><input type="checkbox" name="telangana"> Delivery address is in Telangana</label>'
      + '<p class="rebel-pin-result" role="status"></p></form>';
  }

  function checkPin(form) {
    const input = form.elements.pin;
    const pin = input.value.trim();
    const note = form.querySelector('.rebel-pin-result');
    const valid = /^[1-9]\d{5}$/.test(pin);
    input.setAttribute('aria-invalid', String(!valid));
    if (!valid) {
      note.textContent = 'Enter a six-digit Indian PIN that starts with a digit from 1 to 9.';
      input.focus();
      return;
    }
    const days = form.elements.telangana.checked || pin === '500075' ? '3–5' : '4–7';
    note.textContent = 'Preview estimate for ' + pin + ': ' + days + ' working days from 500075. Carrier coverage and timing will be confirmed at launch.';
  }

  function reportCommerce(name, lines) {
    const items = lines.map(line => {
      const product = byId.get(line.id);
      const colour = findColour(product, line.colourId);
      return { item_id: product.id, item_name: product.name, price: (product.price ?? 0) / 100,
        quantity: line.quantity, item_variant: [colour?.name, line.size].filter(Boolean).join(' / ') };
    });
    window.dispatchEvent(new CustomEvent('stan:commerce', { detail: {
      name,
      params: {
        currency: 'INR',
        value: items.reduce((total, item) => total + item.price * item.quantity, 0),
        items,
      },
    } }));
  }

  function updateCount() {
    const count = bag.reduce((total, line) => total + line.quantity, 0);
    document.querySelectorAll('[data-bag-count]').forEach(element => { element.textContent = count; });
  }

  function saveBag() {
    try {
      localStorage.setItem(bagKey, JSON.stringify(bag));
    } catch {
      // The bag remains available in memory.
    }
    updateCount();
  }

  function totalRows() {
    const subtotal = bag.reduce((total, line) => total + byId.get(line.id).price * line.quantity, 0);
    const discount = Math.round(subtotal * .1);
    return '<dl class="rebel-totals">'
      + '<div><dt>Subtotal</dt><dd>' + inr(subtotal) + '</dd></div>'
      + '<div><dt>First-order preview discount (10%)</dt><dd>−' + inr(discount) + '</dd></div>'
      + '<div><dt>India shipping</dt><dd>Free</dd></div>'
      + '<div class="rebel-total"><dt>Sample total</dt><dd>' + inr(subtotal - discount) + '</dd></div></dl>';
  }

  function showBag(options) {
    if (!bag.length) {
      show('bag', 'Your bag', '<p class="rebel-empty">Your bag is empty.</p><button type="button" class="rebel-primary" data-shop-action="browse">Browse the drop <span aria-hidden="true">↗</span></button>');
      return;
    }
    const lines = bag.map(line => {
      const product = byId.get(line.id);
      const colour = findColour(product, line.colourId);
      const key = lineKey(line);
      const label = product.name + ', ' + colour.name + ', ' + line.size;
      return '<li class="rebel-bag-item"><img src="' + colour.photo + '" alt="" width="62" height="77"><div><h3>' + product.name + '</h3>'
        + '<p>' + colour.name + ' / ' + line.size + '</p><div class="rebel-quantity">'
        + '<button type="button" data-shop-action="less" data-line="' + key + '" aria-label="Decrease quantity for ' + label + '">−</button>'
        + '<span aria-label="Quantity">' + line.quantity + '</span>'
        + '<button type="button" data-shop-action="more" data-line="' + key + '" aria-label="Increase quantity for ' + label + '"' + (line.quantity >= maxQuantity ? ' disabled' : '') + '>+</button>'
        + '<button type="button" data-shop-action="remove" data-line="' + key + '" aria-label="Remove ' + label + '">Remove</button>'
        + '</div></div><strong>' + inr(product.price * line.quantity) + '</strong></li>';
    });
    show('bag', 'Your bag', '<ul class="rebel-bag-list">' + lines.join('') + '</ul>' + totalRows()
      + '<button type="button" class="rebel-primary" data-shop-action="checkout">Checkout preview <span aria-hidden="true">↗</span></button>', options);
  }

  function addToBag() {
    const feedback = dialog.querySelector('.rebel-action-feedback');
    if (!selectedSize) {
      feedback.textContent = 'Choose a demo size.';
      dialog.querySelector('[data-size]').focus();
      return;
    }
    const item = { id: activeProduct.id, colourId: selectedColour.id, size: selectedSize, quantity: 1 };
    const existing = bag.find(line => lineKey(line) === lineKey(item));
    if (existing?.quantity >= maxQuantity) {
      feedback.textContent = 'The demo bag allows up to nine of this option.';
      return;
    }
    if (existing) existing.quantity += 1;
    else bag.push({ ...item });
    saveBag();
    reportCommerce('add_to_cart', [item]);
    reportCommerce('view_cart', bag);
    showBag();
  }

  function updateLine(action, key) {
    const line = bag.find(item => lineKey(item) === key);
    if (!line) return;
    if (action === 'remove' || (action === 'less' && line.quantity === 1)) {
      bag = bag.filter(item => item !== line);
      saveBag();
      showBag();
      return;
    }
    line.quantity = Math.min(maxQuantity, line.quantity + (action === 'more' ? 1 : -1));
    saveBag();
    const focusAction = line.quantity === maxQuantity ? 'less' : action;
    showBag({ focus: '[data-shop-action="' + focusAction + '"][data-line="' + key + '"]' });
  }

  function showCheckout() {
    if (!bag.length) {
      showBag();
      return;
    }
    receiptNumber ??= 'DEMO-' + (globalThis.crypto?.getRandomValues(new Uint32Array(1))[0] ?? Date.now()).toString(36).toUpperCase();
    show('checkout', 'Checkout preview', '<button type="button" class="rebel-inline" data-shop-action="bag">← Back to bag</button>'
      + '<p class="rebel-checkout-note">Guest checkout preview. No login, order or payment required.</p>'
      + '<div class="rebel-demo-destination"><p class="rebel-kicker">Example delivery address</p><p>Sample customer<br>Hyderabad, Telangana · 500075</p></div>'
      + totalRows() + '<button type="button" class="rebel-primary" data-shop-action="receipt">View sample receipt <span aria-hidden="true">↗</span></button>');
  }

  function showReceipt() {
    if (!bag.length) {
      showBag();
      return;
    }
    const lines = bag.map(line => {
      const product = byId.get(line.id);
      const colour = findColour(product, line.colourId);
      return '<tr><th scope="row">' + product.name + '<small>' + colour.name + ' / ' + line.size + '</small></th><td>' + line.quantity + '</td>'
        + '<td>' + inr(product.price) + '</td><td>' + inr(product.price * line.quantity) + '</td></tr>';
    }).join('');
    const issued = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeZone: 'Asia/Kolkata' }).format(new Date());
    show('receipt', 'Receipt preview', '<button class="rebel-inline" type="button" data-shop-action="checkout">← Back to checkout</button>'
      + '<article class="rebel-receipt"><header><strong>The Stan Co.</strong><span>Sample receipt</span></header>'
      + '<div class="rebel-receipt-details"><p><strong>Seller</strong><br>The Stan Co.<br>Merchant details pending</p>'
      + '<p><strong>Bill to</strong><br>Sample customer<br>Hyderabad, Telangana 500075</p>'
      + '<p><strong>Reference</strong><br>' + receiptNumber + '<br>' + issued + '</p></div>'
      + '<table><thead><tr><th scope="col">Item</th><th scope="col">Qty</th><th scope="col">Unit</th><th scope="col">Amount</th></tr></thead>'
      + '<tbody>' + lines + '</tbody></table>' + totalRows() + '<p class="rebel-checkout-note">Sample only. No payment received.</p></article>'
      + '<button type="button" class="rebel-primary rebel-print" data-shop-action="print">Print or save as PDF <span aria-hidden="true">↗</span></button>');
  }

  function closeDialog() {
    dialog.close();
  }

  dialog.addEventListener('close', () => {
    view = undefined;
    receiptNumber = undefined;
    if (clearProductRoute && location.hash.startsWith('#product/')) {
      history.replaceState(null, '', cameFrom || '#shop');
    }
    clearProductRoute = false;
    if (focusedElement?.isConnected) focusedElement.focus({ preventScroll: true });
  });

  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog();
      return;
    }
    const colourButton = event.target.closest('[data-colour]');
    if (colourButton) {
      selectedColour = findColour(activeProduct, colourButton.dataset.colour);
      dialog.querySelectorAll('[data-colour]').forEach(option => option.setAttribute('aria-pressed', String(option === colourButton)));
      const photo = dialog.querySelector('.rebel-detail-photo img');
      photo.src = selectedColour.photo;
      photo.alt = photoAlt(activeProduct, selectedColour);
      return;
    }
    const size = event.target.closest('[data-size]');
    if (size) {
      selectedSize = size.dataset.size;
      dialog.querySelectorAll('[data-size]').forEach(option => option.setAttribute('aria-pressed', String(option === size)));
      dialog.querySelector('.rebel-action-feedback').textContent = '';
      return;
    }
    const button = event.target.closest('[data-shop-action]');
    if (!button) return;
    switch (button.dataset.shopAction) {
      case 'close': closeDialog(); break;
      case 'zoom': showZoom(); break;
      case 'zoom-back': showProduct({ focus: '[data-shop-action="zoom"]' }); break;
      case 'share': void shareProduct(true); break;
      case 'copy': void shareProduct(false); break;
      case 'add': addToBag(); break;
      case 'bag': showBag(); break;
      case 'less':
      case 'more':
      case 'remove': updateLine(button.dataset.shopAction, button.dataset.line); break;
      case 'checkout':
        if (view === 'bag' && bag.length) reportCommerce('begin_checkout', bag);
        showCheckout();
        break;
      case 'receipt': showReceipt(); break;
      case 'print': window.print(); break;
      case 'browse':
        focusedElement = undefined;
        if (location.hash !== '#shop') history.replaceState(null, '', '#shop');
        closeDialog();
        shop.scrollIntoView();
        shop.querySelector('[data-shop-filter]').focus({ preventScroll: true });
        break;
    }
  });

  dialog.addEventListener('submit', event => {
    if (!event.target.matches('[data-pin-check]')) return;
    event.preventDefault();
    checkPin(event.target);
  });

  function openProduct(product) {
    activeProduct = product;
    selectedColour = product.colours[0];
    selectedSize = product.sizes.length === 1 ? product.sizes[0] : undefined;
    showProduct();
    if (product.price != null) reportCommerce('view_item', [{ id: product.id, colourId: selectedColour.id, size: selectedSize, quantity: 1 }]);
  }

  function readRoute() {
    const product = byId.get(location.hash.slice('#product/'.length));
    if (location.hash.startsWith('#product/') && product) {
      clearProductRoute = true;
      openProduct(product);
      return;
    }
    if (clearProductRoute && dialog.open) {
      clearProductRoute = false;
      closeDialog();
    }
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-product], [data-bag]');
    if (!trigger || event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    if (trigger.hasAttribute('data-bag')) {
      event.preventDefault();
      focusedElement = trigger;
      if (bag.length) reportCommerce('view_cart', bag);
      showBag();
      return;
    }
    const product = byId.get(trigger.dataset.product);
    if (!product) return;
    event.preventDefault();
    focusedElement = trigger;
    cameFrom = location.hash || '#shop';
    history.pushState(null, '', '#product/' + product.id);
    clearProductRoute = true;
    openProduct(product);
  });

  window.addEventListener('hashchange', readRoute);
  window.addEventListener('storage', event => {
    if (event.key !== bagKey && event.key !== null) return;
    bag = readBag();
    updateCount();
    if (view === 'bag') showBag();
    if (view === 'checkout') showCheckout();
    if (view === 'receipt') showReceipt();
  });

  updateCount();
  readRoute();
}
