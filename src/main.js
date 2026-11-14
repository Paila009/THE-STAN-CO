import './styles.css';
import './header.css';
import './stage.css';
import './hero-strip.css';
import './store-ui.css';
import { mountAccount } from './account.js';
import { mountDropSections } from './drop-sections.js';
import { mountInformation } from './information.js';
import { mountShop } from './shop.js';
import { mountAnalytics } from './analytics.js';
import { mountMotion } from './motion.js';

mountAnalytics();
mountAccount();
mountDropSections();
mountShop();
mountInformation();
mountMotion();

const joinBar = document.querySelector('[data-guest-account]');
const firstOffer = document.querySelector('[data-first-offer]');
let hasAccount = false;
let offerDismissed = false;

document.addEventListener('stan:account', event => {
  hasAccount = Boolean(event.detail.user);
  joinBar.hidden = hasAccount;
  if (hasAccount) firstOffer.hidden = true;
});

firstOffer.querySelector('[data-dismiss-offer]').addEventListener('click', () => {
  offerDismissed = true;
  firstOffer.hidden = true;
});

try {
  if (!location.search && !location.hash && !sessionStorage.getItem('stan:first-offer')) {
    window.setTimeout(() => {
      if (hasAccount || offerDismissed || document.querySelector('dialog[open]')) return;
      firstOffer.hidden = false;
      sessionStorage.setItem('stan:first-offer', 'shown');
    }, 10_000);
  }
} catch {
  // Browsing and the account bar work without storage.
}

const updates = document.querySelector('[data-updates-form]');
updates.addEventListener('submit', event => {
  event.preventDefault();
  const email = updates.querySelector('input').value.trim();
  const subject = encodeURIComponent('The Stan Co. — Drop updates');
  const body = encodeURIComponent(`Please send me email updates about new drops and early access.\n\nEmail: ${email}`);
  updates.querySelector('[data-updates-status]').textContent = 'Send the draft in your email app to request updates.';
  location.href = `mailto:hey.thestanco@gmail.com?subject=${subject}&body=${body}`;
});
