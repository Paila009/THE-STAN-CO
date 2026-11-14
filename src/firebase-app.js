export const firebaseVersion = '13.3.0';

export const firebaseConfig = {
  apiKey: 'AIzaSyAmx3qZKRLvjx7c22NRxTteMI-Ly-EOfX0',
  authDomain: 'motionbeatz-new.firebaseapp.com',
  projectId: 'motionbeatz-new',
  storageBucket: 'motionbeatz-new.firebasestorage.app',
  messagingSenderId: '1062824791281',
  appId: '1:1062824791281:web:a4a2972c5236224561ad50',
  measurementId: 'G-FCVX45RFWF',
};

export async function loadFirebaseApp() {
  const sdk = await import(/* @vite-ignore */ `https://www.gstatic.com/firebasejs/${firebaseVersion}/firebase-app.js`);
  const defaultApp = sdk.getApps().find(app => app.name === '[DEFAULT]');
  if (defaultApp?.options.projectId === firebaseConfig.projectId) return defaultApp;
  return sdk.initializeApp(firebaseConfig, defaultApp ? 'the-stan-co' : undefined);
}
