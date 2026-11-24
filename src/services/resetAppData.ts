import { DEFAULT_SETTINGS, type AppSettings } from '../types';
import { useBentoStore } from '../store';

const STORAGE_KEYS = ['bento-storage', 'bento_settings'];

const clearLocalStorage = (): string[] => {
  const errors: string[] = [];

  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key) {
        window.localStorage.removeItem(key);
      }
    }
  } catch (error) {
    errors.push('localStorage');
    console.error('[Bento] Failed to clear localStorage', error);
  }

  for (const key of STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      errors.push('localStorage');
      console.error('[Bento] Failed to remove key:', key, error);
    }
  }

  return errors;
};

const clearSessionStorage = (): string[] => {
  const errors: string[] = [];

  try {
    for (let i = 0; i < window.sessionStorage.length; i += 1) {
      const key = window.sessionStorage.key(i);
      if (key) {
        window.sessionStorage.removeItem(key);
      }
    }
  } catch (error) {
    errors.push('sessionStorage');
    console.error('[Bento] Failed to clear sessionStorage', error);
  }

  return errors;
};

const clearCookies = (): string[] => {
  const errors: string[] = [];

  try {
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.trim().split('=')[0];
      if (name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
      }
    });
  } catch (error) {
    errors.push('cookies');
    console.error('[Bento] Failed to clear cookies', error);
  }

  return errors;
};

const clearIndexedDB = async (): Promise<string[]> => {
  const errors: string[] = [];

  if (!('indexedDB' in window)) return errors;

  try {
    const dbNames = typeof indexedDB.databases === 'function'
      ? await indexedDB.databases()
      : [];

    for (const db of dbNames) {
      const dbName = db.name;
      if (!dbName) continue;
      try {
        await new Promise<void>((resolve, reject) => {
          const request = indexedDB.deleteDatabase(dbName);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error ?? new Error('IndexedDB delete failed'));
          request.onblocked = () => {
            console.warn('[Bento] IndexedDB deletion blocked for', dbName);
            resolve();
          };
        });
      } catch (error) {
        errors.push(`indexedDB:${dbName}`);
        console.error('[Bento] Failed to clear IndexedDB database:', dbName, error);
      }
    }
  } catch (error) {
    errors.push('indexedDB');
    console.error('[Bento] Failed to inspect IndexedDB databases', error);
  }

  return errors;
};

const clearCaches = async (): Promise<string[]> => {
  const errors: string[] = [];

  if (!('caches' in window)) return errors;

  try {
    const names = await caches.keys();
    for (const name of names) {
      try {
        await caches.delete(name);
      } catch (error) {
        errors.push(`cache:${name}`);
        console.error('[Bento] Failed to clear cache', name, error);
      }
    }
  } catch (error) {
    errors.push('caches');
    console.error('[Bento] Failed to clear caches', error);
  }

  return errors;
};

const clearServiceWorkers = async (): Promise<string[]> => {
  const errors: string[] = [];

  if (!('serviceWorker' in navigator)) return errors;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      try {
        await registration.unregister();
      } catch (error) {
        errors.push('serviceWorker');
        console.error('[Bento] Failed to unregister service worker', error);
      }
    }
  } catch (error) {
    errors.push('serviceWorker');
    console.error('[Bento] Failed to enumerate service workers', error);
  }

  return errors;
};

const getFreshSettings = (): AppSettings => ({
  ...DEFAULT_SETTINGS,
  onboardingCompleted: false,
  theme: 'dark',
  userName: '',
  currency: 'INR',
});

export async function resetAppData(): Promise<void> {
  const errors: string[] = [];

  errors.push(...clearLocalStorage());
  errors.push(...clearSessionStorage());
  errors.push(...clearCookies());
  errors.push(...(await clearIndexedDB()));
  errors.push(...(await clearCaches()));
  errors.push(...(await clearServiceWorkers()));

  try {
    const persist = useBentoStore.persist;
    if (persist && typeof persist.clearStorage === 'function') {
      persist.clearStorage();
    }
  } catch (error) {
    errors.push('zustand');
    console.error('[Bento] Failed to clear Zustand persist storage', error);
  }

  useBentoStore.setState({
    tasks: [],
    projects: [],
    goals: [],
    habits: [],
    routines: [],
    events: [],
    conversations: [],
    financialTransactions: [],
    financialBudgets: [],
    financialAccounts: [],
    settings: getFreshSettings(),
    searchQuery: '',
    activeView: 'today',
    isLoading: false,
  });

  if (errors.length > 0) {
    console.error('[Bento] Reset completed with storage cleanup errors:', errors);
    throw new Error(`Reset encountered storage cleanup issues: ${errors.join(', ')}`);
  }

  window.setTimeout(() => {
    window.location.reload();
  }, 150);
}
