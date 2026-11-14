import { firebaseConfig, firebaseVersion, loadFirebaseApp } from './firebase-app.js';

const preferenceKey = 'stan:analytics';
const allowedEvents = new Set(['view_item', 'add_to_cart', 'view_cart', 'begin_checkout']);
let analyticsPromise;

function getPreference() {
  try {
    return localStorage.getItem(preferenceKey);
  } catch {
    return null;
  }
}

function setPreference(enabled) {
  try {
    localStorage.setItem(preferenceKey, enabled ? 'yes' : 'no');
  } catch {
    // Use the choice for the current session when local storage is unavailable.
  }
}

function loadAnalytics() {
  if (!analyticsPromise) {
    analyticsPromise = Promise.all([
      loadFirebaseApp(),
      import(/* @vite-ignore */ `https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-analytics.js`),
    ]).then(async ([app, sdk]) => {
      if (!await sdk.isSupported()) return null;
      const analytics = sdk.getAnalytics(app);
      return { sdk, analytics };
    }).catch(() => {
      analyticsPromise = undefined;
      return null;
    });
  }
  return analyticsPromise;
}

export function mountAnalytics() {
  let enabled = getPreference() === 'yes';
  window[`ga-disable-${firebaseConfig.measurementId}`] = !enabled;
  if (enabled) void loadAnalytics();

  const dialog = document.createElement('dialog');
  dialog.className = 'analytics-dialog';
  dialog.setAttribute('aria-labelledby', 'analytics-title');
  dialog.innerHTML = `
    <h2 id="analytics-title">Analytics preferences</h2>
    <p>Optional Google Analytics measures visits and how people browse the shop. Contact details and delivery PINs are excluded.</p>
    <form method="dialog">
      <button class="button button--solid" value="yes">Allow analytics</button>
      <button class="button button--outline" value="no">Decline analytics</button>
    </form>`;
  document.body.append(dialog);
  let opener;
  document.querySelectorAll('[data-analytics-settings]').forEach(button => {
    button.addEventListener('click', () => {
      opener = button;
      dialog.returnValue = '';
      dialog.showModal();
    });
  });
  dialog.addEventListener('close', async () => {
    opener?.focus();
    if (!['yes', 'no'].includes(dialog.returnValue)) return;
    enabled = dialog.returnValue === 'yes';
    window[`ga-disable-${firebaseConfig.measurementId}`] = !enabled;
    setPreference(enabled);
    if (!enabled && !analyticsPromise) return;
    const instance = await (enabled ? loadAnalytics() : analyticsPromise);
    if (instance) instance.sdk.setAnalyticsCollectionEnabled(instance.analytics, enabled);
  });
  window.addEventListener('stan:commerce', async event => {
    if (!enabled || !allowedEvents.has(event.detail?.name)) return;
    const instance = await loadAnalytics();
    if (!instance || !enabled) return;
    instance.sdk.logEvent(instance.analytics, event.detail.name, event.detail.params);
  });
}
