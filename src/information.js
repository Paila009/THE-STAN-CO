import './information.css';

const supportEmail = 'hey.thestanco@gmail.com';
const instagram = 'https://www.instagram.com/thestanco.in/';

export function mountInformation() {
  const container = document.querySelector('#information');
  if (!container) return;

  container.innerHTML = `
    <section class="stan-info__about" id="about" aria-labelledby="about-title">
      <span class="stan-info__eyebrow">About The Stan Co.</span>
      <div class="stan-info__about-content">
        <h2 id="about-title">A label built<br>around drops<span>.</span></h2>
        <p>The Stan Co. is an independent fashion label making curated collections and limited drops. Each collection brings together clothing and accessories with its own point of view.</p>
        <a class="stan-info__browse" href="#shop">Browse the shop <span aria-hidden="true">↗</span></a>
      </div>
    </section>

    <div class="stan-info__care">
      <section class="stan-info__faq" id="faq" aria-labelledby="faq-title">
        <span class="stan-info__eyebrow">Customer care</span>
        <h2 id="faq-title">FAQs</h2>
        <div class="stan-info__questions">
          <details>
            <summary>How do I choose my size?</summary>
            <p>Check the size guide on the product page. For tees, compare the measurements with one you already like the fit of.</p>
          </details>
          <details>
            <summary>Where do you ship?</summary>
            <p>Standard delivery is free across India. See <a href="#shipping">delivery estimates</a> for Telangana and other states.</p>
          </details>
          <details>
            <summary>How do I place or track an order?</summary>
            <p>Checkout and online tracking are currently unavailable in this preview. For help with an existing order, <a href="#contact">contact us</a> with your order ID if you have it.</p>
          </details>
          <details>
            <summary>What if an item arrives damaged?</summary>
            <p>Send us the order ID if available, a short description, and clear photos of the damage or defect. We’ll assess your request. See the <a href="#exchanges">exchange policy</a>.</p>
          </details>
        </div>
      </section>

      <section class="stan-info__contact" id="contact" aria-labelledby="contact-title">
        <span class="stan-info__eyebrow">Contact</span>
        <h2 id="contact-title">Get in touch</h2>
        <p class="stan-info__channels"><a href="mailto:${supportEmail}">${supportEmail}</a><a href="${instagram}">Instagram DM <span aria-hidden="true">↗</span></a></p>
        <form class="stan-info__form" aria-describedby="contact-note">
          <label class="stan-info__full">Enquiry category
            <select name="category" required>
              <option value="">Select a category</option>
              <option>Order-related</option>
              <option>Product-related</option>
              <option>General enquiry</option>
            </select>
          </label>
          <label>Name <input name="name" autocomplete="name" maxlength="90" required></label>
          <label>Email <input name="email" type="email" autocomplete="email" maxlength="160" required></label>
          <label class="stan-info__full"><span>Order ID <span class="stan-info__optional">(optional)</span></span>
            <input name="order" maxlength="60" autocapitalize="off" spellcheck="false">
          </label>
          <label class="stan-info__full">Message
            <textarea name="message" rows="3" maxlength="1000" required></textarea>
          </label>
          <div class="stan-info__full stan-info__form-footer">
            <button type="submit">Open email draft <span aria-hidden="true">↗</span></button>
            <p id="contact-note">Opens your email app with a draft for you to send.</p>
            <p class="stan-info__status" role="status" aria-live="polite"></p>
          </div>
        </form>
      </section>
    </div>

    <div class="stan-info__policies">
      <section id="shipping" aria-labelledby="shipping-title">
        <h2 id="shipping-title">Shipping</h2>
        <p>Free standard shipping across India. Orders dispatch from Hyderabad.</p>
        <dl class="stan-info__delivery">
          <div><dt>Telangana</dt><dd>3–5 working days</dd></div>
          <div><dt>Other states</dt><dd>4–7 working days</dd></div>
        </dl>
        <p class="stan-info__fineprint">Delivery windows are estimates.</p>
      </section>
      <section id="exchanges" aria-labelledby="exchanges-title">
        <h2 id="exchanges-title">Exchanges</h2>
        <p>We consider exchanges for items that arrive damaged or defective, subject to review. General returns and exchanges for size preference or change of mind are unavailable.</p>
        <p><a href="#contact">Contact us</a> with your order ID if available, a short description, and clear photographs of the item. You can attach photos to your email draft.</p>
        <p class="stan-info__fineprint">Your rights under applicable law still apply.</p>
      </section>
      <section id="privacy" aria-labelledby="privacy-title">
        <h2 id="privacy-title">Privacy</h2>
        <p>The contact form prepares a draft on your device. If you send it, the details you chose to include go to our support inbox so we can respond.</p>
        <p>Firebase processes information you provide when signing in. The demo bag is saved on this device. Optional Google Analytics measures site visits and shop activity once you allow it.</p>
        <p>Keep payment credentials and other sensitive information out of support messages. For a privacy enquiry, <a href="mailto:${supportEmail}">email us</a>.</p>
      </section>
    </div>
  `;

  const form = container.querySelector('.stan-info__form');
  const status = form.querySelector('.stan-info__status');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = new FormData(form);
    const name = fields.get('name').trim();
    const email = fields.get('email').trim();
    const message = fields.get('message').trim();
    if (!name || !message) {
      status.textContent = 'Enter your name and a message before opening the draft.';
      form.elements.namedItem(name ? 'message' : 'name').focus();
      return;
    }

    const subject = 'The Stan Co. — ' + fields.get('category');
    const body = [
      'Name: ' + name,
      'Email: ' + email,
      'Order ID: ' + (fields.get('order').trim() || 'Not provided'),
      '',
      message,
    ].join('\r\n');

    status.textContent = 'If your email app doesn’t open, email ' + supportEmail + ' directly.';
    window.location.href = 'mailto:' + supportEmail + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
}
