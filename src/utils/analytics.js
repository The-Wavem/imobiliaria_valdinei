const BAIRROS_STORAGE_KEY = "@valdinei:bairros";
const CONSENT_STORAGE_KEY = "@valdinei:consent_status";
const ACCESS_HISTORY_STORAGE_KEY = "@valdinei:access_history";
const SESSION_LOGGED_KEY = "session_logged";

function readJsonObject(storageKey) {
  const rawValue = window.localStorage.getItem(storageKey);

  if (!rawValue) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
  } catch {
    return {};
  }
}

function writeJsonObject(storageKey, value) {
  window.localStorage.setItem(storageKey, JSON.stringify(value));
}

export function trackBairroView(bairro) {
  if (typeof window === "undefined" || !bairro) {
    return;
  }

  try {
    const stats = readJsonObject(BAIRROS_STORAGE_KEY);
    const normalizedBairro = String(bairro).trim();

    if (!normalizedBairro) {
      return;
    }

    stats[normalizedBairro] = (stats[normalizedBairro] || 0) + 1;
    writeJsonObject(BAIRROS_STORAGE_KEY, stats);
  } catch {
    window.localStorage.setItem(BAIRROS_STORAGE_KEY, JSON.stringify({ [String(bairro).trim()]: 1 }));
  }
}

export function trackPageAccess() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (window.localStorage.getItem(CONSENT_STORAGE_KEY) !== "accepted") {
      return;
    }

    if (window.sessionStorage.getItem(SESSION_LOGGED_KEY)) {
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const history = readJsonObject(ACCESS_HISTORY_STORAGE_KEY);

    history[today] = (history[today] || 0) + 1;
    writeJsonObject(ACCESS_HISTORY_STORAGE_KEY, history);
    window.sessionStorage.setItem(SESSION_LOGGED_KEY, today);
  } catch {
    // Ignora falhas de storage para não bloquear a navegação.
  }
}
