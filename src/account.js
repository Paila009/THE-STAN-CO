import './account.css';
import { firebaseVersion, loadFirebaseApp } from './firebase-app.js';
const pendingEmailKey = 'the-stan-co:pending-account-email';
const sessionKey = 'the-stan-co:account-session';
let firebasePromise;

function loadFirebase() {
  if (firebasePromise) return firebasePromise;
  const base = 'https://www.gstatic.com/firebasejs/' + firebaseVersion;
  firebasePromise = Promise.all([
    loadFirebaseApp(),
    import(/* @vite-ignore */ base + '/firebase-auth.js'),
  ]).then(([app, sdk]) => ({ auth: sdk.getAuth(app), sdk })).catch(error => {
    firebasePromise = undefined;
    throw error;
  });
  return firebasePromise;
}

function readLocal(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function writeLocal(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Users can confirm their email when local storage is unavailable.
  }
}

function friendlyError(error) {
  switch (error?.code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'The Google sign-in window was closed. Try again when you’re ready.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google sign-in window. Allow pop-ups for this store or continue with email.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is unavailable right now. Please try the other option.';
    case 'auth/unauthorized-domain':
    case 'auth/unauthorized-continue-uri':
    case 'auth/invalid-continue-uri':
      return 'Sign-in is unavailable on this web address. Try again from the live store.';
    case 'auth/network-request-failed':
      return 'Couldn’t connect to sign-in. Check your connection and try again.';
    case 'auth/too-many-requests':
      return 'There were too many attempts. Wait a few minutes, then try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email. Continue using your usual sign-in method.';
    case 'auth/invalid-email':
      return 'Enter a valid email address. If you opened a link, use the address it was sent to.';
    case 'auth/user-disabled':
      return 'This account is disabled. Contact The Stan Co. for help.';
    case 'auth/missing-email':
      return 'Enter the email address that received the link.';
    case 'auth/expired-action-code':
    case 'auth/invalid-action-code':
      return 'This link may have expired or already been used. Check the address, or return to sign-in for a new link.';
    default:
      return 'Sign-in is unavailable right now. Please try again.';
  }
}

function continuationUrl() {
  const url = new URL(location.pathname, location.origin);
  url.searchParams.set('account', 'email-link');
  return url.toString();
}

function clearLinkParameters() {
  const url = new URL(location.href);
  for (const key of ['account', 'apiKey', 'mode', 'oobCode', 'continueUrl', 'lang', 'tenantId']) url.searchParams.delete(key);
  history.replaceState(history.state, '', url);
}

export function mountAccount() {
  const existing = document.querySelector('#stan-account-dialog');
  if (existing) return;

  const dialog = document.createElement('dialog');
  dialog.id = 'stan-account-dialog';
  dialog.className = 'stan-account';
  dialog.setAttribute('aria-labelledby', 'stan-account-title');
  dialog.innerHTML = `
    <div class="stan-account__shell">
      <header class="stan-account__head">
        <p class="stan-account__kicker">The Stan Co.</p>
        <button class="stan-account__close" type="button" aria-label="Close account" data-account-close>×</button>
      </header>
      <h2 id="stan-account-title" tabindex="-1">Your account</h2>
      <p class="stan-account__intro" data-account-intro></p>
      <form class="stan-account__form" data-account-form>
        <button class="stan-account__action stan-account__google" type="button" data-account-google>Continue with Google</button>
        <span class="stan-account__divider" data-account-divider>or</span>
        <label class="stan-account__field">
          <span>Email address</span>
          <input type="email" name="email" required autocomplete="email" autocapitalize="none" spellcheck="false" placeholder="you@example.com">
        </label>
        <button class="stan-account__action stan-account__primary" type="submit" data-account-submit>Email me a sign-in link</button>
        <button class="stan-account__text-action" type="button" data-account-restart hidden>Request a new link</button>
      </form>
      <div class="stan-account__profile" data-account-profile hidden>
        <p data-account-email></p>
        <button class="stan-account__action stan-account__primary" type="button" data-account-signout>Sign out</button>
      </div>
      <button class="stan-account__text-action" type="button" data-account-retry hidden>Try again</button>
      <p class="stan-account__status" role="status" data-account-status></p>
      <p class="stan-account__offer" data-account-terms><strong>10% off your first purchase.</strong> The discount applies when checkout is live.</p>
    </div>`;
  document.body.append(dialog);

  const title = dialog.querySelector('#stan-account-title');
  const close = dialog.querySelector('[data-account-close]');
  const intro = dialog.querySelector('[data-account-intro]');
  const form = dialog.querySelector('[data-account-form]');
  const input = form.elements.email;
  const google = dialog.querySelector('[data-account-google]');
  const divider = dialog.querySelector('[data-account-divider]');
  const submit = dialog.querySelector('[data-account-submit]');
  const restart = dialog.querySelector('[data-account-restart]');
  const profile = dialog.querySelector('[data-account-profile]');
  const profileEmail = dialog.querySelector('[data-account-email]');
  const signoutButton = dialog.querySelector('[data-account-signout]');
  const status = dialog.querySelector('[data-account-status]');
  const retry = dialog.querySelector('[data-account-retry]');

  const initialUrl = new URL(location.href);
  let link = initialUrl.searchParams.get('mode') === 'signIn' || initialUrl.searchParams.get('account') === 'email-link'
    ? initialUrl.toString()
    : null;
  let authState;
  let initialization;
  let user = null;
  let lastTrigger;
  let working = false;
  let failed = false;

  function render() {
    const ready = Boolean(authState);
    const showProfile = Boolean(user && !link);
    title.textContent = showProfile ? 'Your account' : link ? 'Confirm your email' : 'Join The Stan Co.';
    intro.textContent = showProfile ? 'Signed in as' : link
      ? 'Enter the address that received your sign-in link.'
      : 'Sign in or create an account with Google or a secure email link.';
    form.hidden = showProfile || failed;
    google.hidden = Boolean(link);
    divider.hidden = Boolean(link);
    submit.textContent = link ? 'Confirm and sign in' : 'Email me a sign-in link';
    restart.hidden = !link;
    google.disabled = submit.disabled = input.disabled = !ready || working;
    signoutButton.disabled = !ready || working;
    form.toggleAttribute('aria-busy', !ready || working);
    profile.hidden = !showProfile;
    profileEmail.textContent = showProfile ? user.email ?? user.displayName ?? '' : '';
    retry.hidden = !failed;
  }

  function setStatus(message, error = false) {
    status.textContent = message;
    status.classList.toggle('stan-account__status--error', error);
  }

  function updateUser(nextUser) {
    const changed = user?.uid !== nextUser?.uid;
    user = nextUser;
    writeLocal(sessionKey, user ? '1' : null);
    for (const label of document.querySelectorAll('[data-account-label]')) {
      label.textContent = user ? (label.dataset.accountSignedInLabel || 'Account')
        : (label.dataset.accountLabel || 'Sign in');
    }
    if (changed) {
      document.dispatchEvent(new CustomEvent('stan:account', { detail: { user: user ? { uid: user.uid } : null } }));
    }
    render();
  }

  async function perform(action) {
    if (working) return;
    working = true;
    setStatus('');
    render();
    try {
      await action();
    } catch (error) {
      setStatus(friendlyError(error), true);
    } finally {
      working = false;
      render();
    }
  }

  async function finishLink(email) {
    await perform(async () => {
      await authState.sdk.signInWithEmailLink(authState.auth, email, link);
      writeLocal(pendingEmailKey, null);
      clearLinkParameters();
      link = null;
      input.value = '';
      updateUser(authState.auth.currentUser);
      setStatus('You’re signed in.');
      if (dialog.open) title.focus();
    });
  }

  function initialize() {
    if (initialization) return initialization;
    failed = false;
    if (!authState) setStatus('Connecting to sign-in…');
    render();
    initialization = loadFirebase().then(async ({ sdk, auth }) => {
      await auth.authStateReady();
      authState = { sdk, auth };
      if (link && !sdk.isSignInWithEmailLink(auth, link)) {
        link = null;
        clearLinkParameters();
        setStatus('This sign-in link is incomplete. Request a new link.', true);
      } else {
        setStatus('');
      }
      updateUser(auth.currentUser);
      sdk.onAuthStateChanged(auth, nextUser => {
        if (user !== nextUser) updateUser(nextUser);
      });
      if (link) {
        const saved = readLocal(pendingEmailKey);
        if (saved) {
          input.value = saved;
          await finishLink(saved);
        }
      }
    }).catch(error => {
      initialization = undefined;
      failed = true;
      setStatus(friendlyError(error), true);
    }).finally(render);
    return initialization;
  }

  function open(trigger, email) {
    if (trigger) lastTrigger = trigger;
    if (email && !link && !user) input.value = email;
    if (!dialog.open) {
      dialog.showModal();
      const field = email ? input : trigger?.dataset.account === 'google' ? google : title;
      if (field.disabled) title.focus();
      else field.focus();
    }
    if (!authState) initialize();
  }

  document.addEventListener('click', event => {
    const trigger = event.target instanceof Element ? event.target.closest('[data-account]') : null;
    if (!trigger) return;
    event.preventDefault();
    open(trigger);
  });
  const quickSignup = document.querySelector('[data-quick-account]');
  quickSignup?.addEventListener('submit', event => {
    event.preventDefault();
    const email = quickSignup.querySelector('input').value.trim();
    if (email) open(quickSignup.querySelector('button'), email);
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    if (lastTrigger?.isConnected) lastTrigger.focus({ preventScroll: true });
    lastTrigger = undefined;
  });
  retry.addEventListener('click', initialize);
  restart.addEventListener('click', () => {
    if (working) return;
    writeLocal(pendingEmailKey, null);
    clearLinkParameters();
    link = null;
    setStatus('');
    render();
    if (user) title.focus();
    else input.focus();
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const email = input.value.trim();
    if (!authState || !email) return;
    if (link) {
      finishLink(email);
      return;
    }
    perform(async () => {
      await authState.sdk.sendSignInLinkToEmail(authState.auth, email, {
        url: continuationUrl(),
        handleCodeInApp: true,
      });
      writeLocal(pendingEmailKey, email);
      setStatus('Check your inbox for a secure sign-in link.');
    });
  });
  google.addEventListener('click', () => {
    if (!authState) return;
    perform(async () => {
      const { sdk, auth } = authState;
      await sdk.signInWithPopup(auth, new sdk.GoogleAuthProvider());
      updateUser(auth.currentUser);
      setStatus('You’re signed in.');
      if (dialog.open) title.focus();
    });
  });
  signoutButton.addEventListener('click', () => {
    if (!authState) return;
    perform(async () => {
      await authState.sdk.signOut(authState.auth);
      writeLocal(pendingEmailKey, null);
      updateUser(null);
      setStatus('Signed out.');
      if (dialog.open) title.focus();
    });
  });

  render();
  if (link) open();
  else if (readLocal(sessionKey)) initialize();
}
