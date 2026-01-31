const STORAGE_KEY = "aa_session_id";

/**
 * Returns a persistent anonymous session id for this browser.
 * Uses localStorage; if missing, generates crypto.randomUUID() and persists it.
 * Same browser keeps the same session_id across chat messages.
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    return crypto.randomUUID();
  }
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}
