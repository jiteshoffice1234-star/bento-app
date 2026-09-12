// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Bento 2 — One-time migration: Dexie IndexedDB → localStorage
// Uses raw IndexedDB API — no Dexie dependency needed
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type {
  Task, Project, Goal, Habit, Routine, CalendarEvent, AIConversation, AppSettings,
} from '../types';
import { DEFAULT_SETTINGS } from '../types';

const STORAGE_KEY = 'bento-storage';
const LEGACY_DB_NAME = 'BentoDB';

function openIDB(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getAllFromStore<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

function hasStore(db: IDBDatabase, name: string): boolean {
  return db.objectStoreNames.contains(name);
}

export async function migrateFromDexie(): Promise<void> {
  // Already migrated
  if (localStorage.getItem(STORAGE_KEY)) return;

  let db: IDBDatabase;
  try {
    db = await openIDB(LEGACY_DB_NAME);
  } catch {
    // No legacy DB exists — fresh install
    return;
  }

  try {
    // Read all tables
    const tasks = hasStore(db, 'tasks') ? await getAllFromStore<Task>(db, 'tasks') : [];
    const projects = hasStore(db, 'projects') ? await getAllFromStore<Project>(db, 'projects') : [];
    const goals = hasStore(db, 'goals') ? await getAllFromStore<Goal>(db, 'goals') : [];
    const habits = hasStore(db, 'habits') ? await getAllFromStore<Habit>(db, 'habits') : [];
    const routines = hasStore(db, 'routines') ? await getAllFromStore<Routine>(db, 'routines') : [];
    const events = hasStore(db, 'events') ? await getAllFromStore<CalendarEvent>(db, 'events') : [];
    const conversations = hasStore(db, 'conversations') ? await getAllFromStore<AIConversation>(db, 'conversations') : [];

    // Check if there's any data to migrate
    const hasData = tasks.length || projects.length || goals.length || habits.length || routines.length || events.length || conversations.length;
    if (!hasData) {
      db.close();
      indexedDB.deleteDatabase(LEGACY_DB_NAME);
      return;
    }

    // Load old settings
    const savedSettings = localStorage.getItem('bento_settings');
    const settings: AppSettings = savedSettings
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) }
      : DEFAULT_SETTINGS;

    // Write in Zustand persist format
    const persistState = {
      state: {
        tasks, projects, goals, habits, routines, events, conversations, settings,
      },
      version: 0,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistState));

    // Clean up
    db.close();
    indexedDB.deleteDatabase(LEGACY_DB_NAME);
    localStorage.removeItem('bento_settings');

    console.log('[Bento] Migrated data from IndexedDB to localStorage');
  } catch (error) {
    console.error('[Bento] Migration failed:', error);
    try { db.close(); } catch { /* ignore */ }
  }
}
