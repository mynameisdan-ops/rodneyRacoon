import { createStore, get, set } from 'idb-keyval';
import { migrate, type SaveData } from './schema';

const db = createStore('long-way-home', 'kv');
const SAVE_KEY = 'save';

/** Loads and migrates the save. Throws NewerSaveError if it must not be touched. */
export async function loadSave(): Promise<SaveData> {
  return migrate(await get(SAVE_KEY, db));
}

let queue: Promise<unknown> = Promise.resolve();

/** Writes are chained so they land in order; the last write always wins. */
export function writeSave(data: SaveData): Promise<void> {
  const next = queue.then(() => set(SAVE_KEY, data, db));
  queue = next.catch(() => {});
  return next;
}

/** Asks the browser not to evict our data under storage pressure (best effort). */
export async function requestPersistentStorage(): Promise<void> {
  try {
    if (navigator.storage?.persisted && !(await navigator.storage.persisted())) {
      await navigator.storage.persist();
    }
  } catch {
    // Not supported or refused; progress still saves, it just isn't protected from eviction.
  }
}
