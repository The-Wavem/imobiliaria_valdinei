const STORAGE_KEY = "@valdinei:bairros";

export function trackBairroView(bairro) {
  if (typeof window === "undefined" || !bairro) {
    return;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    const stats = rawValue ? JSON.parse(rawValue) : {};
    const normalizedBairro = String(bairro).trim();

    if (!normalizedBairro) {
      return;
    }

    stats[normalizedBairro] = (stats[normalizedBairro] || 0) + 1;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ [String(bairro).trim()]: 1 }));
  }
}
