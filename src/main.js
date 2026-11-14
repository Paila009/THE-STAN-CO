import './styles.css';
import { mountAccount } from './account.js';
import { mountInformation } from './information.js';
import { mountShop } from './shop.js';
import { mountAnalytics } from './analytics.js';

mountAnalytics();
mountAccount();
mountShop();
mountInformation();

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

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (!reducedMotion.matches) {
  const intro = document.querySelector('.intro-splash');
  try {
    if (!location.hash && !location.search && !sessionStorage.getItem('stan:opened')) {
      sessionStorage.setItem('stan:opened', '1');
      intro.hidden = false;
      intro.addEventListener('animationend', event => {
        if (event.target === intro) intro.hidden = true;
      });
    }
  } catch {
    // Access to the site does not depend on session storage.
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealing');
        observer.unobserve(entry.target);
      }
    }, { threshold: .14 });
    document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
  }

  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const visual = document.querySelector('[data-tilt]');
    visual.addEventListener('pointermove', event => {
      if (reducedMotion.matches) return;
      const bounds = visual.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      visual.style.setProperty('--tilt-x', `${x * 26}px`);
      visual.style.setProperty('--tilt-y', `${y * 18}px`);
    });
    visual.addEventListener('pointerleave', () => {
      visual.style.removeProperty('--tilt-x');
      visual.style.removeProperty('--tilt-y');
    });
  }
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
